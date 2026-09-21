#!/usr/bin/env python3
"""Build a single-file, offline searchable HTML from the MHLW self-medication
tax-system OTC lists (Excel).

Usage:
    python3 build_otc_search.py --input <folder with .xlsx files> --output otc_search.html

Requires: openpyxl  (pip install openpyxl)

Files are detected by their content (header row), not by file name, so any
MHLW list can simply be dropped into the input folder:
  - product lists (switch OTC / non-switch OTC): header has a "販売名" column
  - kampo formula list: header has "処方名"
  - OTC test kit list: header has "一般的名称"
  - pharmacy-made medicine list: header has "処方番号"

Efficacy labels are NOT part of the source data. They are inferred from the
active ingredients, the dosage form (guessed from package unit / product name)
and the product name. Extend the dictionaries below to improve coverage.
"""
import argparse
import datetime
import glob
import json
import os
import re
import sys
import unicodedata
from collections import OrderedDict, Counter

import openpyxl


# ---------------------------------------------------------------------------
# Small helpers
# ---------------------------------------------------------------------------
def nfkc(value):
    """Normalize to NFKC and strip; None becomes an empty string."""
    if value is None:
        return ""
    return unicodedata.normalize("NFKC", str(value)).strip()


def split_ingredients(text):
    """Split a comma separated ingredient cell into a clean list."""
    out = []
    for token in re.split(r"[、,，/／]", nfkc(text)):
        token = token.strip()
        if token:
            out.append(token)
    return out


# ---------------------------------------------------------------------------
# Category definitions (id -> label / short efficacy / search keywords)
# ---------------------------------------------------------------------------
CATEGORIES = OrderedDict([
    ("cold", dict(
        label="かぜ薬",
        eff="かぜの諸症状(鼻水・鼻づまり・くしゃみ・のどの痛み・せき・たん・発熱・頭痛・関節痛・筋肉痛)の緩和",
        kw="かぜ 風邪 感冒 総合感冒薬 発熱 熱 頭痛 鼻水 鼻づまり くしゃみ せき たん のどの痛み 悪寒")),
    ("pain", dict(
        label="解熱鎮痛薬",
        eff="頭痛・歯痛・生理痛・神経痛・腰痛・筋肉痛・関節痛などの鎮痛、悪寒・発熱時の解熱",
        kw="解熱 鎮痛 痛み止め 頭痛 歯痛 生理痛 月経痛 神経痛 腰痛 筋肉痛 関節痛 発熱 熱")),
    ("cough", dict(
        label="せき止め・去痰薬",
        eff="せき・たん、のどの炎症による声がれ・のどの痛み・不快感の緩和",
        kw="せき 咳 咳止め せき止め 鎮咳 去痰 たん 痰 のど 喉 声がれ ぜんそく 喘息")),
    ("rhinitis", dict(
        label="鼻炎用内服薬",
        eff="急性鼻炎・アレルギー性鼻炎・副鼻腔炎の鼻水・鼻づまり・くしゃみ・なみだ目・頭重の緩和",
        kw="鼻炎 鼻水 鼻づまり くしゃみ 花粉症 アレルギー性鼻炎 副鼻腔炎 蓄膿症 頭重")),
    ("nasal", dict(
        label="点鼻薬",
        eff="急性鼻炎・アレルギー性鼻炎・副鼻腔炎の鼻水・鼻づまり・くしゃみの緩和",
        kw="点鼻 鼻炎 鼻水 鼻づまり くしゃみ 花粉症 アレルギー性鼻炎")),
    ("eye", dict(
        label="点眼薬",
        eff="目のかゆみ・充血・アレルギー性結膜炎などの緩和",
        kw="点眼 目薬 目 眼 かゆみ 充血 花粉症 アレルギー 結膜炎")),
    ("antihist", dict(
        label="抗ヒスタミン薬(内服)",
        eff="アレルギー症状(じんましん・皮膚のかゆみ・鼻炎など)の緩和",
        kw="アレルギー 抗ヒスタミン じんましん 蕁麻疹 かゆみ 皮膚 花粉症 鼻炎")),
    ("itch", dict(
        label="外用かゆみ止め",
        eff="皮膚のかゆみ・虫さされ・あせも・じんましん・湿疹・皮膚炎の緩和",
        kw="かゆみ 痒み 虫さされ 虫刺され あせも 汗疹 じんましん 湿疹 皮膚炎 かぶれ 塗り薬 外用")),
    ("pain_ext", dict(
        label="外用鎮痛消炎薬",
        eff="筋肉痛・肩こり・腰痛・関節痛・打撲・捻挫・腱鞘炎・筋肉疲労の鎮痛消炎",
        kw="湿布 貼り薬 塗り薬 外用 筋肉痛 肩こり 腰痛 関節痛 打撲 捻挫 腱鞘炎 五十肩 テニス肘 筋肉疲労")),
    ("ext_mixed", dict(
        label="外用(かゆみ・消炎鎮痛)",
        eff="かゆみ・虫さされ・あせも、または肩こり・筋肉痛などの緩和(外用)",
        kw="外用 塗り薬 かゆみ 虫さされ あせも 肩こり 筋肉痛 湿疹")),
    ("kampo_cold", dict(
        label="漢方(かぜ・せき・鼻炎)",
        eff="かぜ・せき・鼻炎などの漢方薬(マオウ配合)",
        kw="漢方 かぜ 風邪 感冒 せき 咳 鼻炎 鼻水 鼻づまり 頭痛 肩こり")),
    ("kampo_joint", dict(
        label="漢方(関節痛・むくみ)",
        eff="関節痛・神経痛・筋肉痛・むくみなどの漢方薬(マオウ配合)",
        kw="漢方 関節痛 神経痛 筋肉痛 むくみ 浮腫 リウマチ")),
    ("kampo_diet", dict(
        label="漢方(肥満・便秘)",
        eff="肥満症・便秘・むくみなどの漢方薬(防風通聖散 系)",
        kw="漢方 肥満 ダイエット やせ 便秘 むくみ 高血圧 のぼせ")),
    ("gi", dict(
        label="胃腸薬",
        eff="胃痛・胸やけ・胃もたれ・下痢・便秘などの緩和",
        kw="胃腸 胃痛 胸やけ 胃もたれ むかつき 下痢 便秘 整腸")),
    ("fungal", dict(
        label="水虫・たむし薬",
        eff="水虫・いんきんたむし・ぜにたむし・カンジダなどの真菌症",
        kw="水虫 たむし 白癬 カンジダ 真菌 抗真菌 足 外用")),
    ("steroid", dict(
        label="外用ステロイド",
        eff="湿疹・皮膚炎・かゆみ・あせも・虫さされなどの炎症",
        kw="ステロイド 湿疹 皮膚炎 かゆみ あせも 虫さされ かぶれ 外用 塗り薬")),
    ("hair", dict(
        label="発毛剤",
        eff="壮年性脱毛症における発毛・育毛・脱毛の進行予防",
        kw="発毛 育毛 脱毛 薄毛 ミノキシジル")),
    ("other", dict(
        label="その他(未分類)",
        eff="効能は成分から自動判定できませんでした。添付文書をご確認ください",
        kw="")),
])

FORMS = OrderedDict([
    ("oral", "内服"),
    ("topical", "外用(塗る)"),
    ("patch", "貼付(湿布・パッチ)"),
    ("eye", "点眼"),
    ("nasal", "点鼻"),
])

# ---------------------------------------------------------------------------
# Ingredient groups used by the rule-based classifier
# ---------------------------------------------------------------------------
ANALG = {"アセトアミノフェン", "エテンザミド", "アスピリン", "サリチルアミド",
         "ラクチルフェネチジン", "イソプロピルアンチピリン"}
ANTIH = {"クロルフェニラミン", "ジフェンヒドラミン", "カルビノキサミン", "トリプロリジン",
         "ジフェニルピラリン", "プロメタジン"}
COUGH_STRONG = {"ジヒドロコデイン", "コデイン", "デキストロメトルファン", "ノスカピン",
                "チペピジン", "ペントキシベリン", "クロペラスチン", "ナンテンジツ",
                "ブロムヘキシン", "メトキシフェナミン", "トリメトキノール"}
COUGH_WEAK = {"メチルエフェドリン", "エフェドリン"}
DECONG = {"テトラヒドロゾリン", "ナファゾリン", "フェニレフリン"}
TOPICAL = {"サリチル酸グリコール", "サリチル酸メチル", "サリチル酸"}
KNOWN = ANALG | ANTIH | COUGH_STRONG | COUGH_WEAK | DECONG | TOPICAL | {"マオウ", "ジリュウ"}

# Extra rules for ingredients that mainly appear in the switch-OTC list.
# (keys are matched as substrings of the ingredient name)
# tuple: (rule id, keys, category or special, efficacy override)
EXTRA_RULES = [
    ("nsaid", ["ロキソプロフェン", "ジクロフェナク", "インドメタシン", "フェルビナク",
               "ケトプロフェン", "ピロキシカム", "フルルビプロフェン", "ナプロキセン"], None, None),
    ("ibu", ["イブプロフェン"], None, None),
    ("allergy_nasal", ["ベクロメタゾン", "フルチカゾン", "モメタゾン"], "nasal", None),
    ("allergy", ["ロラタジン", "フェキソフェナジン", "セチリジン", "エピナスチン", "ベポタスチン",
                 "ケトチフェン", "アゼラスチン", "レボカバスチン", "クロモグリク"], None, None),
    ("gi_h2", ["ファモチジン", "シメチジン", "ニザチジン", "ロキサチジン", "ラニチジン"], "gi",
     "胃痛・胸やけ・もたれ・むかつき(胃酸の出過ぎ)の緩和"),
    ("gi_diar", ["ロペラミド", "ベルベリン", "ゲンノショウコ"], "gi", "下痢・食あたり・はき下しの緩和"),
    ("gi_const", ["ビサコジル", "センナ", "センノシド", "ピコスルファート", "ダイオウ"], "gi", "便秘の緩和"),
    ("gi", ["ブチルスコポラミン", "ロートエキス", "酸化マグネシウム", "水酸化マグネシウム",
            "炭酸マグネシウム", "ジメチコン", "ウルソデオキシコール酸", "乳酸菌", "ビフィズス菌",
            "スクラルファート", "水酸化アルミニウム"], "gi", None),
    ("fungal", ["テルビナフィン", "ブテナフィン", "ラノコナゾール", "ネチコナゾール", "ルリコナゾール",
                "ミコナゾール", "クロトリマゾール", "ビホナゾール", "エコナゾール", "スルコナゾール",
                "シクロピロクス", "アモロルフィン", "オキシコナゾール", "イソコナゾール"], "fungal", None),
    ("steroid", ["ヒドロコルチゾン", "プレドニゾロン", "デキサメタゾン", "ベタメタゾン",
                 "クロベタゾン", "フルオシノロン", "トリアムシノロン"], "steroid", None),
    ("hair", ["ミノキシジル"], "hair", None),
    ("eye_misc", ["ネオスチグミン", "プラノプロフェン", "フルオロメトロン"], "eye",
     "目の疲れ・充血・かゆみ・炎症の緩和"),
]

# ---------------------------------------------------------------------------
# Kampo formulas: normalized name -> (category, rough efficacy)
# NOTE: efficacy text is a general guide only; the package insert takes priority.
# ---------------------------------------------------------------------------
KAMPO_EFF = {
    "越婢加朮湯": ("kampo_joint", "むくみ・関節痛・湿疹"),
    "葛根湯": ("kampo_cold", "かぜの初期・肩こり・頭痛・鼻かぜ"),
    "葛根湯加川きゅう辛夷": ("kampo_cold", "鼻づまり・蓄膿症・慢性鼻炎"),
    "桂枝芍薬知母湯": ("kampo_joint", "関節痛・神経痛"),
    "桂麻各半湯": ("kampo_cold", "かぜのこじれ・皮膚のかゆみ"),
    "五虎湯": ("kampo_cold", "せき・気管支ぜんそく"),
    "五積散": ("kampo_joint", "胃腸炎・腰痛・神経痛・冷え・月経痛"),
    "柴葛解肌湯": ("kampo_cold", "かぜ(発熱・頭痛)"),
    "小青竜湯": ("kampo_cold", "鼻炎・水様の鼻水・せき"),
    "小青竜湯加杏仁石膏": ("kampo_cold", "せき・気管支炎・ぜんそく"),
    "小青竜湯加杏仁石膏(小青竜湯合麻杏甘石湯)": ("kampo_cold", "せき・気管支炎・ぜんそく"),
    "神秘湯": ("kampo_cold", "小児ぜんそく・気管支炎・せき"),
    "続命湯": ("kampo_joint", "手足のしびれ・疼痛"),
    "独活葛根湯": ("kampo_joint", "四十肩・五十肩・肩こり"),
    "防風通聖散": ("kampo_diet", "肥満症・便秘・むくみ"),
    "麻黄湯": ("kampo_cold", "かぜ・インフルエンザの初期・関節痛・鼻づまり"),
    "麻黄附子細辛湯": ("kampo_cold", "かぜ(悪寒)・気管支炎・アレルギー性鼻炎"),
    "麻杏甘石湯": ("kampo_cold", "せき・小児ぜんそく・気管支ぜんそく"),
    "麻杏よく甘湯": ("kampo_joint", "関節痛・神経痛・筋肉痛"),
    "よく苡仁湯": ("kampo_joint", "関節痛・筋肉痛"),
    "麗沢通気湯加辛夷": ("kampo_cold", "鼻づまり・嗅覚障害"),
    "麻黄加朮湯": ("kampo_joint", "関節痛・神経痛・かぜ"),
    "太陽爽鼻湯": ("kampo_cold", "鼻炎・鼻づまり(製品名からの推定)"),
    # kampo-tab-only formulas (2027 additions) below
    "安中散": (None, "胃痛・胸やけ・神経性胃炎"),
    "安中散加茯苓": (None, "胃痛・胸やけ"),
    "胃風湯": (None, "下痢・腹痛(慢性胃腸炎)"),
    "胃苓湯": (None, "食あたり・下痢・むくみ・暑さ負け"),
    "茵ちん蒿湯": (None, "黄疸・じんましん・口内炎・便秘"),
    "茵ちん五苓散": (None, "嘔吐・じんましん・むくみ・二日酔い"),
    "黄耆建中湯": (None, "虚弱体質・寝汗・病後の衰弱"),
    "黄ごん湯": (None, "下痢・腹痛・吐き気"),
    "黄連解毒湯": (None, "のぼせ・鼻血・二日酔い・皮膚炎"),
    "黄連湯": (None, "胃痛・急性胃炎・口臭"),
    "乙字湯": (None, "痔核・切れ痔・便秘・痔の痛み"),
    "かっ香正気散": (None, "夏かぜ・胃腸炎・暑さ負け"),
    "葛根黄連黄ごん湯": (None, "下痢・発熱"),
    "加味平胃散": (None, "胃もたれ・消化不良"),
    "乾姜人参半夏丸": (None, "つわり・嘔吐"),
    "甘草瀉心湯": (None, "胃腸炎・口内炎・不眠"),
    "甘草湯": (None, "のどの痛み・せき・急な痛み"),
    "桔梗湯": (None, "のどの痛み・扁桃炎"),
    "駆風解毒散(湯)": (None, "のどの痛み・扁桃炎"),
    "九味檳榔湯": (None, "むくみ・動悸・高血圧に伴う頭痛"),
    "荊芥連翹湯": (None, "蓄膿症・慢性鼻炎・にきび・扁桃炎"),
    "桂枝加葛根湯": (None, "肩こり・頭痛・かぜ(汗が出る)"),
    "桂枝加芍薬大黄湯": (None, "便秘・腹痛"),
    "桂枝加芍薬湯": (None, "しぶり腹・腹痛"),
    "桂枝加朮附湯": (None, "関節痛・神経痛"),
    "桂枝加苓朮附湯": (None, "関節痛・神経痛"),
    "桂枝湯": (None, "かぜの初期・頭痛"),
    "桂枝茯苓丸": (None, "月経不順・月経痛・更年期障害・肩こり"),
    "甲字湯": (None, "痔・便秘"),
    "香砂平胃散": (None, "胃もたれ・消化不良"),
    "香砂六君子湯": (None, "胃炎・食欲不振・胃痛"),
    "香蘇散": (None, "かぜの初期・胃腸虚弱・頭痛"),
    "牛膝散": (None, "月経痛・月経不順"),
    "牛車腎気丸": (None, "下肢痛・しびれ・頻尿・むくみ"),
    "呉茱萸湯": (None, "頭痛・片頭痛・吐き気"),
    "五苓散": (None, "むくみ・二日酔い・下痢・頭痛・口渇"),
    "柴陥湯": (None, "せき・胸痛"),
    "柴胡加竜骨牡蠣湯": (None, "神経症・不眠・動悸"),
    "柴胡桂枝乾姜湯": (None, "更年期障害・神経症・不眠・動悸"),
    "柴胡桂枝湯": (None, "かぜのこじれ・胃炎・腹痛"),
    "柴胡清肝湯": (None, "神経症・慢性扁桃炎・湿疹(小児)"),
    "柴芍六君子湯": (None, "胃炎・食欲不振"),
    "柴朴湯": (None, "気管支ぜんそく・せき・不安神経症"),
    "柴苓湯": (None, "水様性下痢・むくみ・暑気あたり"),
    "三黄瀉心湯": (None, "のぼせ・便秘・鼻血・高血圧に伴う症状"),
    "滋陰降火湯": (None, "せき・のどの痛み"),
    "紫雲膏": (None, "やけど・痔・あかぎれ(外用)"),
    "四逆散": (None, "胃炎・神経症"),
    "四逆湯": (None, "冷え・下痢"),
    "芍薬甘草湯": (None, "こむら返り・筋肉痛・腹痛"),
    "芍薬甘草附子湯": (None, "関節痛・神経痛・筋肉痛"),
    "十全大補湯": (None, "病後の体力低下・貧血・食欲不振"),
    "十味敗毒湯": (None, "化膿性皮膚疾患・湿疹・じんましん・にきび"),
    "潤腸湯": (None, "便秘"),
    "生姜瀉心湯": (None, "胃腸炎・胃痛・吐き気"),
    "小建中湯": (None, "虚弱体質・腹痛・夜尿症"),
    "小柴胡湯": (None, "長引くかぜ・胃腸炎・気管支炎"),
    "小半夏加茯苓湯": (None, "つわり・吐き気"),
    "消風散": (None, "湿疹・皮膚炎・あせも・かゆみ"),
    "升麻葛根湯": (None, "かぜの初期・じんましん・皮膚炎"),
    "四苓湯": (None, "下痢・嘔吐・むくみ"),
    "辛夷清肺湯": (None, "鼻づまり・慢性鼻炎・蓄膿症"),
    "神仙太乙膏": (None, "切り傷・腫れ物・湿疹(外用)"),
    "参蘇飲": (None, "せき・かぜ(胃腸虚弱)"),
    "真武湯": (None, "下痢・むくみ・冷え・胃腸疾患"),
    "参苓白朮散": (None, "胃腸虚弱・下痢・食欲不振"),
    "清上けん痛湯(駆風触痛湯)": (None, "頭痛・顔面の痛み"),
    "清暑益気湯": (None, "暑さ負け・夏やせ"),
    "清肺湯": (None, "せき・たん"),
    "折衝飲": (None, "月経不順・月経痛・産後の腹痛"),
    "川きゅう茶調散": (None, "かぜ・慢性頭痛"),
    "疎経活血湯": (None, "関節痛・神経痛・腰痛・筋肉痛"),
    "蘇子降気湯": (None, "せき・ぜんそく"),
    "大黄甘草湯": (None, "便秘"),
    "大黄牡丹皮湯": (None, "月経不順・便秘・痔疾"),
    "大建中湯": (None, "腹痛・腹部膨満感"),
    "大柴胡湯去大黄": (None, "胃炎・胆石症・高血圧に伴う肩こり"),
    "竹茹温胆湯": (None, "かぜのこじれ・せき・不眠"),
    "竹葉石膏湯": (None, "せき・口渇・熱性疾患後の疲労"),
    "治打撲一方": (None, "打撲・捻挫"),
    "調胃承気湯": (None, "便秘"),
    "釣藤散": (None, "慢性頭痛・高血圧に伴うめまい・肩こり"),
    "通導散": (None, "月経不順・月経痛・便秘・打撲"),
    "桃核承気湯": (None, "月経不順・月経痛・便秘・のぼせ"),
    "当帰建中湯": (None, "月経痛・下腹部痛"),
    "当帰四逆加呉茱萸生姜湯": (None, "しもやけ・頭痛・下腹部痛・腰痛"),
    "当帰芍薬散": (None, "月経不順・月経痛・冷え症・貧血・更年期障害"),
    "当帰芍薬散加人参": (None, "月経不順・月経痛・冷え症・貧血"),
    "二陳湯": (None, "吐き気・嘔吐・胃部不快"),
    "人参湯(理中丸)": (None, "胃腸虚弱・下痢・嘔吐・胃痛"),
    "人参養栄湯": (None, "病後の体力低下・食欲不振・貧血"),
    "排膿散": (None, "化膿性の腫れ物"),
    "排膿散及湯": (None, "化膿性の腫れ物"),
    "麦門冬湯": (None, "たんの切れにくいせき・気管支炎・のどの乾燥"),
    "八味地黄丸": (None, "疲労・腰痛・下肢痛・しびれ・頻尿・むくみ"),
    "半夏厚朴湯": (None, "不安神経症・のどのつかえ・つわり・せき"),
    "半夏散及湯": (None, "のどの痛み"),
    "半夏瀉心湯": (None, "胃腸炎・口内炎・胸やけ・下痢"),
    "半夏白朮天麻湯": (None, "頭痛・めまい・胃腸虚弱"),
    "茯苓飲": (None, "胃もたれ・胃痛"),
    "茯苓沢瀉湯": (None, "胃炎・吐き気"),
    "附子理中湯": (None, "胃腸虚弱・下痢・腹痛(冷え)"),
    "分消湯(実脾飲)": (None, "むくみ・腹部膨満感"),
    "平胃散": (None, "食べすぎ・消化不良・食欲不振"),
    "補気健中湯(補気建中湯)": (None, "むくみ・腹部膨満感"),
    "補中益気湯": (None, "疲労倦怠・食欲不振・病後の衰弱"),
    "麻子仁丸": (None, "便秘"),
    "味麦地黄丸": (None, "せき・のどの乾燥"),
    "木防已湯": (None, "むくみ・動悸・息切れ"),
    "六君子湯": (None, "胃炎・食欲不振・胃痛・嘔吐"),
    "苓甘姜味辛夏仁湯": (None, "せき・水様の痰・鼻炎"),
    "苓姜朮甘湯": (None, "腰痛・冷え・夜尿症"),
    "苓桂朮甘湯": (None, "めまい・立ちくらみ・動悸・頭痛"),
    "苓桂味甘湯": (None, "せき・のぼせ・動悸"),
}

# Alias spellings found in product names -> canonical key in KAMPO_EFF
KAMPO_ALIASES = {
    "桂枝麻黄各半湯": "桂麻各半湯",
    "カッコン湯": "葛根湯",
    "麻杏薏甘湯": "麻杏よく甘湯",
    "薏苡仁湯": "よく苡仁湯",
    "防風通聖散料": "防風通聖散",
}
# Product-name hints for kampo-like products that do not spell a formula name
KAMPO_NAME_HINTS = [
    (r"ナイシトール|スリム|ダイエット|やせ|痩|エバユース|ココ|攻肥聖健|防風", "kampo_diet",
     "肥満症・便秘・むくみ(防風通聖散系)"),
    (r"鼻|辛夷|爽鼻", "kampo_cold", "鼻炎・鼻づまり・鼻水"),
    (r"のど|喉|浅田飴|ぜんそく|喘息|せき|咳|止咳|ゴホ", "kampo_cold", "せき・たん・のどの痛み"),
    (r"腰痛|関節|神経痛|痛効", "kampo_joint", "腰痛・関節痛・神経痛"),
    (r"かぜ|感冒|風邪|カゼ|葛根|カコナ|カッコ", "kampo_cold", "かぜの初期・肩こり・頭痛"),
]


def normalize_kampo_text(text):
    """Normalize spelling variants so product names match formula names."""
    s = nfkc(text)
    s = s.replace("芎", "きゅう").replace("龍", "竜").replace("薏", "よく")
    # Private-use gaiji and katakana spelling of the character used in 薏苡仁 / 麻杏薏甘湯
    s = s.replace("\ue00a", "よく").replace("ヨク", "よく")
    s = s.replace("蔯", "ちん").replace("芩", "ごん").replace("蠣", "蠣")
    return s


# Pre-computed normalized lookup, longest name first so that
# "葛根湯加川きゅう辛夷" wins over "葛根湯".
_KAMPO_LOOKUP = sorted(
    [(normalize_kampo_text(k), k) for k in KAMPO_EFF if KAMPO_EFF[k][0]] +
    [(normalize_kampo_text(a), v) for a, v in KAMPO_ALIASES.items()],
    key=lambda x: -len(x[0]))


def find_kampo_formula(name):
    """Return the canonical formula key found inside a product name, or None."""
    n = normalize_kampo_text(name)
    for norm, canon in _KAMPO_LOOKUP:
        if norm in n:
            return canon
    return None


# ---------------------------------------------------------------------------
# Excel loading
# ---------------------------------------------------------------------------
def load_rows(path):
    """Yield (sheet_title, list_of_rows) for every sheet in a workbook."""
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    for ws in wb.worksheets:
        yield ws.title, [list(r) for r in ws.iter_rows(values_only=True)]


def find_header(rows, must_have, limit=15):
    """Return (index, header) of the first row whose cells equal every label.

    Exact cell matching avoids false hits on sentences that merely mention a
    label (e.g. a note line containing "一般的名称").
    """
    for i, row in enumerate(rows[:limit]):
        cells = [nfkc(c) for c in row]
        if all(m in cells for m in must_have):
            return i, cells
    return None, None


def col_index(header, *labels):
    """Index of the first header cell containing any label (else None)."""
    for lab in labels:
        for i, c in enumerate(header):
            if lab in c:
                return i
    return None


def find_as_of(rows):
    """Find a '...時点' string near the top of a sheet."""
    for row in rows[:8]:
        for c in row:
            if c and "時点" in str(c):
                return nfkc(c).strip("()（）")
    return ""


def parse_products(rows, source):
    """Parse a product table (switch / non-switch OTC list)."""
    hi, header = find_header(rows, ["販売名"])
    if hi is None:
        return []
    c_no = col_index(header, "No")
    c_name = col_index(header, "販売名")
    c_jan = col_index(header, "JAN")
    c_pack = col_index(header, "包装")
    c_seller = col_index(header, "発売元")
    c_mfr = col_index(header, "製造販売")
    c_ing = col_index(header, "有効成分", "成分")
    c_note = col_index(header, "備考")
    out = []
    for r in rows[hi + 1:]:
        def g(ci):
            return nfkc(r[ci]) if ci is not None and ci < len(r) else ""
        name = g(c_name)
        # Skip empty rows and header rows repeated inside the sheet
        if not name or name in ("販売名", "削除する品目"):
            continue
        note = g(c_note)
        # Rows without a serial number sit in the "removed" block of the list.
        no_serial = c_no is not None and (c_no >= len(r) or r[c_no] in (None, ""))
        removed = ("削除" in note) or no_serial
        out.append(dict(name=name, jan=g(c_jan), pack=g(c_pack), seller=g(c_seller),
                        mfr=g(c_mfr), ings=split_ingredients(g(c_ing)), note=note,
                        removed=removed, source=source))
    return out


# ---------------------------------------------------------------------------
# Classification
# ---------------------------------------------------------------------------
ORAL_UNIT_RE = re.compile(r"錠|カプセル|包|粒|日分|CP|丸|個分")
LIQ_RE = re.compile(r"(\d+(?:\.\d+)?)\s*m[lL]")
EXT_KW_RE = re.compile(r"クリーム|軟膏|ローション|ジェル|ゲル|ミスト|スプレー|リニメント|ゾル|外用|パッチ|パップ|テープ|塗|液体|雪")
ORAL_KW_RE = re.compile(r"シロップ|内服|顆粒|細粒|散|かぜ|カゼ|せき|エキス|ドロップ|トローチ|飴")
NASAL_RE = re.compile(r"点鼻|ノーズ|ナザール|ナーゼ")
EYE_RE = re.compile(r"目薬|点眼|眼|アイ|ｱｲ")


def guess_form(name, ings, units):
    """Guess dosage form from package units and product name."""
    S = set(ings)
    patch = any("枚" in u for u in units)
    if patch:
        return "patch"
    if any(ORAL_UNIT_RE.search(u) for u in units):
        return "oral"
    liquid = [float(m.group(1)) for u in units for m in [LIQ_RE.search(u)] if m]
    nm = nfkc(name)
    if NASAL_RE.search(nm):
        return "nasal"
    # Drinkable liquids ("飲む...", syrups, internal liquids) are oral even if unit is mL
    if re.search(r"飲む|内服|シロップ", nm) and not (S & TOPICAL):
        return "oral"
    small = bool(liquid) and min(liquid) <= 30
    # Decongestant sprays such as "鼻炎スプレー" are nasal products
    if (S & DECONG) and re.search(r"鼻|スプレー", nm) and not (S & (ANALG | COUGH_STRONG | TOPICAL)):
        return "nasal"
    if (S & (ANTIH | DECONG)) and not (S & (ANALG | COUGH_STRONG | TOPICAL)) and \
            small and not EXT_KW_RE.search(nm) and not ORAL_KW_RE.search(nm):
        # Small-volume liquid with antihistamine / decongestant only: eye drops.
        if S & DECONG or "クロルフェニラミン" in S or EYE_RE.search(nm):
            return "eye"
    if EYE_RE.search(nm) and re.search(r"目薬|点眼|眼", nm):
        return "eye"
    if S & (ANALG | COUGH_STRONG | {"ジリュウ", "マオウ"}):
        return "oral"
    if ORAL_KW_RE.search(nm) and not EXT_KW_RE.search(nm) and not (S & TOPICAL):
        return "oral"
    if S & TOPICAL or S & ANTIH:
        return "topical"
    if S & COUGH_WEAK:
        return "topical" if EXT_KW_RE.search(nm) else "oral"
    return "oral" if not EXT_KW_RE.search(nm) else "topical"


def classify_kampo_only(name):
    """Category and efficacy for products whose only ingredient is マオウ."""
    canon = find_kampo_formula(name)
    if canon:
        cat, eff = KAMPO_EFF[canon]
        return (cat or "kampo_cold"), eff
    nm = nfkc(name)
    for pattern, cat, eff in KAMPO_NAME_HINTS:
        if re.search(pattern, nm):
            return cat, eff
    return "kampo_cold", "かぜ・せき・鼻炎などの漢方薬(マオウ配合・詳細は添付文書を参照)"


def classify_extra(name, S, form):
    """Fallback rules for ingredients outside the OTC-cold/analgesic set."""
    unknown = [i for i in S if i not in KNOWN]
    for rule_id, keys, cat, eff in EXTRA_RULES:
        for ing in unknown:
            if any(k in ing for k in keys):
                if rule_id in ("nsaid", "ibu"):
                    if rule_id == "ibu" and "ピコノール" in ing:
                        return "other", None
                    return ("pain" if form == "oral" else "pain_ext"), None
                if rule_id == "allergy":
                    if form == "eye":
                        return "eye", None
                    if form == "nasal":
                        return "nasal", None
                    return "antihist", None
                return cat, eff
    return None, None


def classify(name, ings, units):
    """Return (category_id, form_id, efficacy_text) for one product group."""
    S = set(ings)
    nm = nfkc(name)

    # Kampo products (マオウ only)
    if S and S <= {"マオウ"}:
        cat, eff = classify_kampo_only(name)
        return cat, "oral", eff

    form = guess_form(name, ings, units)

    # Ingredients outside the known OTC cold/analgesic set (mostly switch OTC)
    if S - KNOWN:
        cat, eff = classify_extra(name, S, form)
        if cat:
            return cat, form, eff or CATEGORIES[cat]["eff"]

    a = S & ANALG
    h = S & ANTIH
    cs = S & COUGH_STRONG
    cw = S & (COUGH_WEAK | {"マオウ"})
    d = S & DECONG
    t = S & TOPICAL
    jr = "ジリュウ" in S
    cold_kw = bool(re.search(r"かぜ|カゼ|感冒|風邪", nm))
    rhin_kw = bool(re.search(r"鼻炎|鼻", nm))
    cough_kw = bool(re.search(r"せき|咳", nm))

    if form == "eye":
        return "eye", form, None
    if form == "nasal":
        return "nasal", form, None
    if form == "patch":
        if t:
            return "pain_ext", form, None
        return ("itch" if h else "other"), form, None
    if form == "topical":
        if t and h:
            return "ext_mixed", form, None
        if t:
            return "pain_ext", form, None
        if h or cw:
            return "itch", form, None
        return "other", form, None

    # --- oral ---
    if jr and not (a or h or cs or cw or d):
        return "pain", form, "かぜの解熱(地竜エキス)"
    if a:
        if h or cs or cw or d or jr or cold_kw:
            return "cold", form, None
        return "pain", form, None
    if cs:
        if h and rhin_kw and not cough_kw:
            return "rhinitis", form, None
        if h and cold_kw:
            return "cold", form, None
        return "cough", form, None
    if h or cw or d:
        if h and (cw or d):
            if cough_kw:
                return "cough", form, None
            if cold_kw:
                return "cold", form, None
            return "rhinitis", form, None
        if h:
            if cough_kw:
                return "cough", form, None
            if cold_kw:
                return "cold", form, None
            return ("rhinitis" if rhin_kw else "antihist"), form, None
        if d:
            return "rhinitis", form, None
        return ("rhinitis" if rhin_kw and not cough_kw else "cough"), form, None
    if jr:
        return "pain", form, "かぜの解熱(地竜エキス)"
    return "other", form, None


# ---------------------------------------------------------------------------
# Build the data blob
# ---------------------------------------------------------------------------
def group_products(products):
    """Group rows by (name, ingredients); collect makers and package lines.

    Rows with the same product name and ingredients but different makers are
    merged into one card. The maker is stored per package only when a card
    spans more than one maker.
    """
    groups = OrderedDict()
    for p in products:
        key = (p["name"], tuple(p["ings"]))
        grp = groups.setdefault(key, dict(name=p["name"], ings=p["ings"], packs=[],
                                          mfrs=OrderedDict(), sellers=OrderedDict(),
                                          makers=set(), sources=set()))
        seller = p["seller"] if p["seller"] and p["seller"] != p["mfr"] else ""
        if p["mfr"]:
            grp["mfrs"][p["mfr"]] = 1
        if seller:
            grp["sellers"][seller] = 1
        grp["makers"].add((p["mfr"], seller))
        maker = p["mfr"] + ((" / 発売元: " + seller) if seller else "")
        grp["packs"].append([p["jan"], p["pack"], p["note"], 1 if p["removed"] else 0, maker])
        grp["sources"].add(p["source"])
    out = []
    for grp in groups.values():
        if len(grp["makers"]) <= 1:
            grp["packs"] = [pk[:4] for pk in grp["packs"]]
        grp["mfr"] = "、".join(grp["mfrs"].keys())
        grp["seller"] = "、".join(grp["sellers"].keys())
        out.append(grp)
    return out


def parse_kampo_list(rows):
    hi, header = find_header(rows, ["処方名"])
    if hi is None:
        return []
    c_kind = col_index(header, "区分")
    c_start = col_index(header, "適用開始")
    c_name = col_index(header, "処方名")
    out = []
    kind = ""
    for r in rows[hi + 1:]:
        name = nfkc(r[c_name]) if c_name is not None and c_name < len(r) else ""
        if not name or name.startswith("※"):
            continue
        if c_kind is not None and r[c_kind]:
            kind = nfkc(r[c_kind])
        canon = None
        n_norm = normalize_kampo_text(name).replace("（", "(").replace("）", ")")
        for k in KAMPO_EFF:
            if normalize_kampo_text(k).replace("（", "(").replace("）", ")") == n_norm:
                canon = k
                break
        eff = KAMPO_EFF[canon][1] if canon else ""
        start = nfkc(r[c_start]) if c_start is not None and c_start < len(r) and r[c_start] else ""
        out.append([name, eff, "current" if kind == "現行" else "new", start])
    return out


def parse_pharmacy_list(rows):
    hi, header = find_header(rows, ["処方番号"])
    if hi is None:
        return []
    c_code = col_index(header, "処方番号")
    c_name = col_index(header, "漢方処方名")
    out = []
    for r in rows[hi + 1:]:
        code = nfkc(r[c_code]) if c_code is not None and c_code < len(r) else ""
        if not code:
            continue
        kname = nfkc(r[c_name]) if c_name is not None and c_name < len(r) else ""
        if kname in ("－", "-", "―"):
            kname = ""
        if re.match(r"^K\d", code):
            group = "漢方"
        else:
            group = re.sub(r"\s*[0-9].*$", "", code)
        out.append([group, code, kname])
    return out


def parse_kits(rows):
    hi, header = find_header(rows, ["一般的名称"])
    if hi is None:
        return []
    c_kind = col_index(header, "区分")
    c_name = col_index(header, "一般的名称")
    out = []
    for r in rows[hi + 1:]:
        name = nfkc(r[c_name]) if c_name is not None and c_name < len(r) else ""
        if not name or not name.startswith("一般用"):
            continue
        kind = nfkc(r[c_kind]) if c_kind is not None and c_kind < len(r) else ""
        out.append([name, "current" if kind == "現行" else "new"])
    return out


def build_data(input_dir):
    files = sorted(glob.glob(os.path.join(input_dir, "*.xlsx")))
    if not files:
        sys.exit("No .xlsx files found in %s" % input_dir)

    products, kampo, pharm, kits, sources = [], [], [], [], []
    for path in files:
        base = os.path.basename(path)
        for title, rows in load_rows(path):
            if find_header(rows, ["販売名"])[0] is not None:
                # Label the list from its title cells ("非スイッチOTC..." vs "スイッチOTC...")
                joined = " ".join(nfkc(c) for r in rows[:4] for c in r if c)
                if "非スイッチ" in joined or "非スイッチ" in base:
                    label = "非スイッチOTC"
                elif "スイッチ" in joined:
                    label = "スイッチOTC"
                else:
                    label = "OTC"
                rows_p = parse_products(rows, label)
                if rows_p:
                    products.extend(rows_p)
                    as_of = re.search(r"R\d+\.\d+", joined)
                    sources.append(dict(label=label + " 品目リスト", file=base,
                                        asOf=as_of.group(0) if as_of else "", n=len(rows_p)))
            # NOTE: check 処方番号 before 処方名 because "漢方処方名" also contains "処方名"
            elif find_header(rows, ["処方番号"])[0] is not None:
                got = parse_pharmacy_list(rows)
                if got:
                    pharm = got
                    sources.append(dict(label="薬局製造販売医薬品リスト", file=base, asOf=find_as_of(rows), n=len(got)))
            elif find_header(rows, ["処方名"])[0] is not None:
                got = parse_kampo_list(rows)
                if got:
                    kampo = got
                    sources.append(dict(label="漢方製剤リスト", file=base, asOf=find_as_of(rows), n=len(got)))
            elif find_header(rows, ["一般的名称"])[0] is not None:
                got = parse_kits(rows)
                if got:
                    kits = got
                    sources.append(dict(label="OTC検査薬リスト", file=base, asOf=find_as_of(rows), n=len(got)))

    cat_ids = list(CATEGORIES.keys())
    form_ids = list(FORMS.keys())
    ing_index = OrderedDict()
    unmapped = Counter()
    items = []
    for grp in group_products(products):
        units = [nfkc(p[1]) for p in grp["packs"]]
        cat, form, eff = classify(grp["name"], grp["ings"], units)
        if cat == "other":
            for i in grp["ings"]:
                if i not in KNOWN:
                    unmapped[i] += 1
        for i in grp["ings"]:
            ing_index.setdefault(i, len(ing_index))
        all_removed = all(p[3] for p in grp["packs"])
        items.append(dict(
            n=grp["name"], m=grp["mfr"], s=grp["seller"],
            g=[ing_index[i] for i in grp["ings"]],
            c=cat_ids.index(cat), f=form_ids.index(form),
            e=eff or CATEGORIES[cat]["eff"],
            p=grp["packs"], r=1 if all_removed else 0,
            k=",".join(sorted(grp["sources"]))))
    items.sort(key=lambda x: x["n"])

    if unmapped:
        print("Ingredients with no efficacy rule (extend EXTRA_RULES): " +
              ", ".join("%s(%d)" % kv for kv in unmapped.most_common(40)), file=sys.stderr)

    data = dict(
        meta=dict(generated=datetime.date.today().isoformat(), sources=sources,
                  nProducts=len(products), nGroups=len(items)),
        cats=[dict(id=k, **v) for k, v in CATEGORIES.items()],
        forms=[dict(id=k, label=v) for k, v in FORMS.items()],
        ings=list(ing_index.keys()), items=items,
        kampo=kampo, pharm=pharm, kits=kits)
    return data


# ---------------------------------------------------------------------------
# HTML rendering
# ---------------------------------------------------------------------------
def render_html(data):
    blob = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    # Keep the JSON safe inside a <script> element
    blob = blob.replace("</", "<\\/").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")
    return HTML_TEMPLATE.replace("__DATA_JSON__", blob)


HTML_TEMPLATE = r'''<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>市販薬検索 | セルフメディケーション税制対象品目</title>
<style>
/* Color tokens; dark mode overrides follow the OS setting */
:root{
  --bg:#f6f7f9; --card:#ffffff; --ink:#1c2430; --sub:#5b6675; --line:#dde2e9;
  --accent:#0b6bcb; --accent-ink:#ffffff; --chip:#eef2f7; --chip-on:#0b6bcb;
  --warn-bg:#fff6e0; --warn-ink:#6b4b00; --gone:#9a3b3b; --new:#0a7a4d;
  --radius:10px; --shadow:0 1px 2px rgba(20,30,50,.06);
}
@media (prefers-color-scheme: dark){
  :root{
    --bg:#12161c; --card:#1a2029; --ink:#e6ebf2; --sub:#9aa7b8; --line:#2b3441;
    --accent:#5aa8ff; --accent-ink:#0b1320; --chip:#232b37; --chip-on:#5aa8ff;
    --warn-bg:#2b2410; --warn-ink:#f1d48a; --gone:#ff8f8f; --new:#5fd6a0;
    --shadow:none;
  }
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);
  font:15px/1.6 system-ui,-apple-system,"Hiragino Sans","Yu Gothic UI","Meiryo",sans-serif}
.wrap{max-width:980px;margin:0 auto;padding:16px}
h1{font-size:1.35rem;margin:6px 0 2px}
.lead{color:var(--sub);font-size:.85rem;margin:0 0 12px}
.notice{background:var(--warn-bg);color:var(--warn-ink);border-radius:var(--radius);
  padding:8px 12px;font-size:.82rem;margin:0 0 14px}
.tabs{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 12px;border-bottom:1px solid var(--line)}
.tab{appearance:none;background:none;border:0;border-bottom:3px solid transparent;color:var(--sub);
  padding:8px 12px;font:inherit;cursor:pointer}
.tab[aria-selected="true"]{color:var(--accent);border-color:var(--accent);font-weight:600}
.panel[hidden]{display:none}
.search{display:flex;gap:8px;position:sticky;top:0;z-index:5;background:var(--bg);padding:6px 0}
.search input[type=search]{flex:1;font:inherit;padding:11px 14px;border:1px solid var(--line);
  border-radius:var(--radius);background:var(--card);color:var(--ink);min-width:0}
input:focus-visible,select:focus-visible,button:focus-visible,summary:focus-visible{
  outline:2px solid var(--accent);outline-offset:1px}
.filters{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);
  padding:10px 12px;margin:6px 0 10px;box-shadow:var(--shadow)}
.frow{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:4px 0}
.flabel{font-size:.75rem;color:var(--sub);min-width:4.5em}
.chip{appearance:none;border:1px solid var(--line);background:var(--chip);color:var(--ink);
  border-radius:999px;padding:3px 10px;font:inherit;font-size:.8rem;cursor:pointer}
.chip[aria-pressed="true"]{background:var(--chip-on);color:var(--accent-ink);border-color:var(--chip-on)}
.chip .n{opacity:.65;font-size:.72rem;margin-left:3px}
.ctl{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:6px}
.ctl select,.ctl input{font:inherit;font-size:.85rem;padding:5px 8px;border:1px solid var(--line);
  border-radius:8px;background:var(--card);color:var(--ink);max-width:100%}
.ctl label{font-size:.82rem;color:var(--sub)}
.status{display:flex;justify-content:space-between;color:var(--sub);font-size:.82rem;margin:6px 2px}
.card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);
  padding:11px 14px;margin:0 0 8px;box-shadow:var(--shadow)}
.card.gone{opacity:.62}
.name{font-size:1.02rem;font-weight:650;margin:0 0 3px;word-break:break-word}
mark{background:rgba(255,200,0,.35);color:inherit;border-radius:3px;padding:0 1px}
.badges{display:flex;flex-wrap:wrap;gap:5px;margin:2px 0 4px}
.badge{font-size:.72rem;padding:1px 8px;border-radius:999px;border:1px solid var(--line);color:var(--sub)}
.badge.cat{background:var(--chip);color:var(--ink);font-weight:600}
.badge.gone{color:var(--gone);border-color:var(--gone)}
.badge.new{color:var(--new);border-color:var(--new)}
.eff{margin:2px 0 6px}
.meta{font-size:.82rem;color:var(--sub)}
.ing{display:inline-block;border:1px solid var(--line);border-radius:6px;padding:0 6px;margin:0 4px 3px 0;
  font-size:.78rem;color:var(--ink);background:transparent;cursor:pointer;font-family:inherit}
details{margin-top:4px;font-size:.82rem}
summary{cursor:pointer;color:var(--accent)}
details.filters{font-size:inherit;margin:6px 0 10px}
details.filters>summary{font-size:.85rem;font-weight:600;margin-bottom:4px}
.packs{margin:4px 0 0;padding:0;list-style:none;color:var(--sub)}
.packs li{padding:1px 0}
.packs .rm{text-decoration:line-through;color:var(--gone)}
.more{display:block;margin:10px auto;padding:9px 22px;font:inherit;border-radius:999px;cursor:pointer;
  border:1px solid var(--accent);background:transparent;color:var(--accent)}
.empty{text-align:center;color:var(--sub);padding:30px 0}
table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);
  border-radius:var(--radius);overflow:hidden;font-size:.88rem}
th,td{text-align:left;padding:7px 10px;border-bottom:1px solid var(--line);vertical-align:top}
th{background:var(--chip);font-size:.78rem;color:var(--sub)}
.tbl-scroll{overflow-x:auto}
footer{color:var(--sub);font-size:.76rem;margin:22px 0 10px;overflow-wrap:anywhere}
footer ul{margin:4px 0;padding-left:18px}
@media (max-width:560px){ .wrap{padding:12px} .flabel{min-width:100%} }
</style>
</head>
<body>
<div class="wrap">
  <h1>市販薬検索</h1>
  <p class="lead">厚生労働省「セルフメディケーション税制」対象品目リストから作成(オフライン動作・単一ファイル)</p>
  <div class="notice">
    <strong>ご注意:</strong> 掲載は税制対象品目のみで、全ての市販薬ではありません。「効能」は有効成分・剤形・商品名からの<strong>機械的な推定(目安)</strong>です。
    購入・服用の前に、必ず製品の添付文書・パッケージ、または薬剤師・登録販売者の説明を確認してください。
  </div>

  <div class="tabs" role="tablist" id="tabs"></div>

  <!-- Products -->
  <section class="panel" id="p-products" role="tabpanel">
    <div class="search">
      <input type="search" id="q" placeholder="商品名・成分・症状で検索 (例: 頭痛 / 葛根湯 / アセトアミノフェン / 4987...)" autocomplete="off" aria-label="検索">
    </div>
    <details class="filters" id="filters" open>
      <summary>絞り込み(効能・剤形・成分・製造販売業者)</summary>
      <div class="frow"><span class="flabel">効能</span><span id="f-cats" class="frow" style="margin:0"></span></div>
      <div class="frow"><span class="flabel">剤形</span><span id="f-forms" class="frow" style="margin:0"></span></div>
      <div class="ctl">
        <label>成分 <select id="f-ing"><option value="">すべて</option></select></label>
        <label>製造販売業者 <input id="f-mfr" list="mfr-list" placeholder="例: ロート" autocomplete="off"></label>
        <datalist id="mfr-list"></datalist>
        <label>並び順 <select id="f-sort">
          <option value="rel">関連順</option><option value="kana">50音順</option><option value="mfr">メーカー順</option>
        </select></label>
        <label><input type="checkbox" id="f-removed"> 削除済みも表示</label>
        <button class="chip" id="f-reset" type="button">条件をクリア</button>
      </div>
    </details>
    <div class="status"><span id="count"></span><span id="hint"></span></div>
    <div id="results"></div>
    <button class="more" id="more" hidden>さらに表示</button>
  </section>

  <!-- Kampo formulas -->
  <section class="panel" id="p-kampo" role="tabpanel" hidden>
    <div class="search"><input type="search" id="q-kampo" placeholder="処方名・症状で絞り込み (例: 鼻 / 葛根湯 / 便秘)" aria-label="漢方処方を検索"></div>
    <p class="meta">税制対象の漢方処方リストです。効能は一般的な目安で、実際の効能・効果は各製品の添付文書が優先されます。</p>
    <div class="tbl-scroll"><table><thead><tr><th>処方名</th><th>主な効能(目安)</th><th>区分</th></tr></thead><tbody id="tb-kampo"></tbody></table></div>
  </section>

  <!-- Pharmacy-made -->
  <section class="panel" id="p-pharm" role="tabpanel" hidden>
    <div class="search"><input type="search" id="q-pharm" placeholder="分類・処方番号・処方名で絞り込み" aria-label="薬局製造販売医薬品を検索"></div>
    <p class="meta">薬局が製造販売する医薬品のうち、税制対象となる処方番号の一覧です(2027年1月1日から対象に追加)。</p>
    <div class="tbl-scroll"><table><thead><tr><th>分類</th><th>処方番号</th><th>漢方処方名</th></tr></thead><tbody id="tb-pharm"></tbody></table></div>
  </section>

  <!-- Test kits -->
  <section class="panel" id="p-kits" role="tabpanel" hidden>
    <p class="meta">税制対象となるOTC検査薬の一般的名称です。</p>
    <div class="tbl-scroll"><table><thead><tr><th>一般的名称</th><th>区分</th></tr></thead><tbody id="tb-kits"></tbody></table></div>
  </section>

  <footer>
    <div>出典データ:</div>
    <ul id="sources"></ul>
    <div>出典: 厚生労働省「セルフメディケーション税制(医療費控除の特例)について」 https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000124853.html</div>
    <div>生成日: <span id="gen"></span></div>
  </footer>
</div>

<script type="application/json" id="data">__DATA_JSON__</script>
<script>
(function () {
  "use strict";
  var D = JSON.parse(document.getElementById("data").textContent);
  var PAGE = 60;

  // ---- text helpers -------------------------------------------------------
  // Normalize for matching: NFKC, lowercase, hiragana -> katakana
  function norm(s) {
    s = String(s || "").normalize("NFKC").toLowerCase();
    var out = "";
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      out += (c >= 0x3041 && c <= 0x3096) ? String.fromCharCode(c + 0x60) : s.charAt(i);
    }
    return out;
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c];
    });
  }
  function terms(q) { return norm(q).split(/\s+/).filter(Boolean); }
  // Highlight query terms inside a plain string (matching is done on normalized text;
  // NFKC can change lengths, so highlight only when lengths stay aligned)
  function hl(text, ts) {
    var n = norm(text);
    if (n.length !== text.length || !ts.length) return esc(text);
    var mask = new Array(text.length).fill(false);
    ts.forEach(function (t) {
      var from = 0, at;
      while ((at = n.indexOf(t, from)) >= 0) {
        for (var k = at; k < at + t.length; k++) mask[k] = true;
        from = at + Math.max(t.length, 1);
      }
    });
    var res = "", open = false;
    for (var i = 0; i < text.length; i++) {
      if (mask[i] && !open) { res += "<mark>"; open = true; }
      if (!mask[i] && open) { res += "</mark>"; open = false; }
      res += esc(text.charAt(i));
    }
    return res + (open ? "</mark>" : "");
  }
  function $(id) { return document.getElementById(id); }

  // ---- prepare items ------------------------------------------------------
  var cats = D.cats, forms = D.forms, ings = D.ings;
  var items = D.items;
  items.forEach(function (it) {
    var cat = cats[it.c], ingNames = it.g.map(function (i) { return ings[i]; });
    it._ing = ingNames;
    it._name = norm(it.n);
    it._eff = norm(it.e);
    it._ingn = norm(ingNames.join(" "));
    it._idx = norm([it.n, it.m, it.s, ingNames.join(" "), cat.label, cat.kw, it.e,
      forms[it.f].label, it.p.map(function (p) { return p[0]; }).join(" ")].join(" "));
  });

  // Start with the filter panel collapsed on narrow screens
  if (window.matchMedia && window.matchMedia("(max-width:640px)").matches) $("filters").open = false;

  // ---- tabs ---------------------------------------------------------------
  var TABS = [
    ["products", "市販薬 (" + items.length + ")"],
    ["kampo", "漢方処方 (" + D.kampo.length + ")"],
    ["pharm", "薬局製造販売医薬品 (" + D.pharm.length + ")"],
    ["kits", "OTC検査薬 (" + D.kits.length + ")"]
  ];
  var tabsEl = $("tabs");
  TABS.forEach(function (t, i) {
    var b = document.createElement("button");
    b.className = "tab"; b.type = "button"; b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", i === 0 ? "true" : "false");
    b.dataset.tab = t[0]; b.textContent = t[1];
    b.addEventListener("click", function () { showTab(t[0]); });
    tabsEl.appendChild(b);
  });
  function showTab(id) {
    Array.prototype.forEach.call(tabsEl.children, function (b) {
      b.setAttribute("aria-selected", b.dataset.tab === id ? "true" : "false");
    });
    TABS.forEach(function (t) { $("p-" + t[0]).hidden = (t[0] !== id); });
  }

  // ---- filter widgets -----------------------------------------------------
  var state = {q: "", cats: {}, forms: {}, ing: "", mfr: "", removed: false, sort: "rel", shown: PAGE};

  function counts(key) {
    var c = {};
    items.forEach(function (it) { c[it[key]] = (c[it[key]] || 0) + 1; });
    return c;
  }
  function buildChips(elId, list, key, stateKey) {
    var el = $(elId), cnt = counts(key);
    list.forEach(function (o, idx) {
      if (!cnt[idx]) return;
      var b = document.createElement("button");
      b.type = "button"; b.className = "chip"; b.setAttribute("aria-pressed", "false");
      b.innerHTML = esc(o.label) + '<span class="n">' + cnt[idx] + "</span>";
      b.addEventListener("click", function () {
        var on = !state[stateKey][idx];
        state[stateKey][idx] = on;
        b.setAttribute("aria-pressed", on ? "true" : "false");
        state.shown = PAGE; render();
      });
      el.appendChild(b);
    });
  }
  buildChips("f-cats", cats, "c", "cats");
  buildChips("f-forms", forms, "f", "forms");

  var ingCount = {};
  items.forEach(function (it) { it._ing.forEach(function (n) { ingCount[n] = (ingCount[n] || 0) + 1; }); });
  Object.keys(ingCount).sort(function (a, b) { return ingCount[b] - ingCount[a]; }).forEach(function (n) {
    var o = document.createElement("option"); o.value = n; o.textContent = n + " (" + ingCount[n] + ")";
    $("f-ing").appendChild(o);
  });
  var mfrCount = {};
  items.forEach(function (it) { if (it.m) mfrCount[it.m] = (mfrCount[it.m] || 0) + 1; });
  Object.keys(mfrCount).sort(function (a, b) { return a.localeCompare(b, "ja"); }).forEach(function (m) {
    var o = document.createElement("option"); o.value = m; $("mfr-list").appendChild(o);
  });

  var timer = null;
  function debounced() { clearTimeout(timer); timer = setTimeout(function () { state.shown = PAGE; render(); }, 90); }
  $("q").addEventListener("input", function (e) { state.q = e.target.value; debounced(); });
  $("f-ing").addEventListener("change", function (e) { state.ing = e.target.value; state.shown = PAGE; render(); });
  $("f-mfr").addEventListener("input", function (e) { state.mfr = e.target.value; debounced(); });
  $("f-sort").addEventListener("change", function (e) { state.sort = e.target.value; state.shown = PAGE; render(); });
  $("f-removed").addEventListener("change", function (e) { state.removed = e.target.checked; state.shown = PAGE; render(); });
  $("more").addEventListener("click", function () { state.shown += PAGE; render(); });
  $("f-reset").addEventListener("click", function () {
    state.q = ""; state.cats = {}; state.forms = {}; state.ing = ""; state.mfr = ""; state.removed = false;
    state.sort = "rel"; state.shown = PAGE;
    $("q").value = ""; $("f-ing").value = ""; $("f-mfr").value = ""; $("f-sort").value = "rel"; $("f-removed").checked = false;
    Array.prototype.forEach.call(document.querySelectorAll("#f-cats .chip,#f-forms .chip"), function (b) {
      b.setAttribute("aria-pressed", "false");
    });
    render();
  });

  // ---- search -------------------------------------------------------------
  function anyOn(map) { return Object.keys(map).some(function (k) { return map[k]; }); }

  function search() {
    var ts = terms(state.q), mfr = norm(state.mfr).trim();
    var useCats = anyOn(state.cats), useForms = anyOn(state.forms);
    var res = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (it.r && !state.removed) continue;
      if (useCats && !state.cats[it.c]) continue;
      if (useForms && !state.forms[it.f]) continue;
      if (state.ing && it._ing.indexOf(state.ing) < 0) continue;
      if (mfr && norm(it.m + " " + it.s).indexOf(mfr) < 0) continue;
      var score = 0, ok = true;
      for (var j = 0; j < ts.length; j++) {
        var t = ts[j];
        if (it._name.indexOf(t) === 0) score += 30;
        else if (it._name.indexOf(t) > 0) score += 20;
        else if (it._eff.indexOf(t) >= 0) score += 12;
        else if (it._ingn.indexOf(t) >= 0) score += 10;
        else if (it._idx.indexOf(t) >= 0) score += 5;
        else { ok = false; break; }
      }
      if (ok) res.push([score, it]);
    }
    if (state.sort === "kana") res.sort(function (a, b) { return a[1].n.localeCompare(b[1].n, "ja"); });
    else if (state.sort === "mfr") res.sort(function (a, b) { return (a[1].m || "").localeCompare(b[1].m || "", "ja") || a[1].n.localeCompare(b[1].n, "ja"); });
    else if (ts.length) res.sort(function (a, b) { return b[0] - a[0]; });
    return {list: res, ts: ts};
  }

  function card(it, ts) {
    var cat = cats[it.c], form = forms[it.f];
    var badges = '<span class="badge cat">' + esc(cat.label) + '</span><span class="badge">' + esc(form.label) + "</span>";
    if (it.r) badges += '<span class="badge gone">リスト削除</span>';
    var ingHtml = it._ing.map(function (n) {
      return '<button type="button" class="ing" data-ing="' + esc(n) + '" title="この成分で絞り込み">' + hl(n, ts) + "</button>";
    }).join("");
    var mk = it.m ? "製造販売: " + hl(it.m, ts) : "";
    if (it.s) mk += (mk ? " / " : "") + "発売元: " + hl(it.s, ts);
    var packs = it.p.map(function (p) {
      var extra = [];
      if (p[0]) extra.push("JAN " + hl(p[0], ts));
      if (p[2]) extra.push(esc(p[2]));
      if (p[4]) extra.push(hl(p[4], ts));
      return '<li class="' + (p[3] ? "rm" : "") + '">' + esc(p[1] || "(包装記載なし)") +
        (extra.length ? " ・ " + extra.join(" ・ ") : "") + "</li>";
    }).join("");
    return '<article class="card' + (it.r ? " gone" : "") + '">' +
      '<h3 class="name">' + hl(it.n, ts) + "</h3>" +
      '<div class="badges">' + badges + "</div>" +
      '<div class="eff">' + esc(it.e) + "</div>" +
      '<div class="meta"><div>有効成分: ' + ingHtml + "</div><div>" + mk + "</div></div>" +
      "<details><summary>包装・JANコード (" + it.p.length + ")</summary><ul class=\"packs\">" + packs + "</ul></details>" +
      "</article>";
  }

  function render() {
    var r = search(), total = r.list.length, shown = Math.min(state.shown, total);
    $("count").textContent = total + " 件" + (total > shown ? "(先頭 " + shown + " 件を表示)" : "");
    $("hint").textContent = state.q ? "" : "商品名・成分・症状(例: 頭痛、鼻水)で検索できます";
    var html = "";
    for (var i = 0; i < shown; i++) html += card(r.list[i][1], r.ts);
    $("results").innerHTML = html || '<div class="empty">該当する商品がありません。条件を変えてお試しください。</div>';
    $("more").hidden = total <= shown;
    try { history.replaceState(null, "", state.q ? "#q=" + encodeURIComponent(state.q) : location.pathname + location.search); } catch (e) {}
  }
  $("results").addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest(".ing") : null;
    if (!b) return;
    state.ing = b.dataset.ing; $("f-ing").value = state.ing; state.shown = PAGE; render();
    window.scrollTo({top: 0, behavior: "smooth"});
  });

  // ---- simple tables ------------------------------------------------------
  function fillTable(tbId, qId, rows, cellsFn) {
    var tb = $(tbId);
    function draw() {
      var ts = qId ? terms($(qId).value) : [];
      var html = "";
      rows.forEach(function (r) {
        var hay = norm(r.join(" "));
        if (ts.every(function (t) { return hay.indexOf(t) >= 0; })) html += cellsFn(r, ts);
      });
      tb.innerHTML = html || '<tr><td colspan="3" class="empty">該当なし</td></tr>';
    }
    if (qId) $(qId).addEventListener("input", draw);
    draw();
  }
  function statusBadge(s) {
    return s === "new" ? '<span class="badge new">2027/1/1 追加</span>' : '<span class="badge">現行</span>';
  }
  fillTable("tb-kampo", "q-kampo", D.kampo, function (r, ts) {
    return "<tr><td>" + hl(r[0], ts) + "</td><td>" + (r[1] ? hl(r[1], ts) : '<span class="meta">—</span>') +
      "</td><td>" + statusBadge(r[2]) + "</td></tr>";
  });
  fillTable("tb-pharm", "q-pharm", D.pharm, function (r, ts) {
    return "<tr><td>" + hl(r[0], ts) + "</td><td>" + hl(r[1], ts) + "</td><td>" + hl(r[2] || "", ts) + "</td></tr>";
  });
  fillTable("tb-kits", null, D.kits, function (r) {
    return "<tr><td>" + esc(r[0]) + "</td><td>" + statusBadge(r[1]) + "</td></tr>";
  });

  // ---- footer / init --------------------------------------------------------
  $("sources").innerHTML = D.meta.sources.map(function (s) {
    return "<li>" + esc(s.label) + " (" + s.n + " 行" + (s.asOf ? " / " + esc(s.asOf) : "") + ") — " + esc(s.file) + "</li>";
  }).join("");
  $("gen").textContent = D.meta.generated;

  try {
    var m = /^#q=(.*)$/.exec(location.hash);
    if (m) { state.q = decodeURIComponent(m[1]); $("q").value = state.q; }
  } catch (e) {}
  render();
})();
</script>
</body>
</html>
'''


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--input", "-i", default=".", help="folder containing the MHLW .xlsx files")
    ap.add_argument("--output", "-o", default="otc_search.html", help="output HTML path")
    args = ap.parse_args()

    data = build_data(args.input)
    html = render_html(data)
    with open(args.output, "w", encoding="utf-8") as fh:
        fh.write(html)
    print("Wrote %s (%.1f KB): %d product rows -> %d groups; kampo=%d pharmacy=%d kits=%d" % (
        args.output, len(html.encode("utf-8")) / 1024, data["meta"]["nProducts"],
        data["meta"]["nGroups"], len(data["kampo"]), len(data["pharm"]), len(data["kits"])))


if __name__ == "__main__":
    main()
