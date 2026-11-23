"""The Rehman Family Treasure: a vertical (9:16) kids' film.

Twelve storybook scenes hang in one column on a warm board, top to bottom in story order, with a
CLUE card in the gap before each clue scene. The camera fills the frame with each scene and pushes
in slowly while the character speaks, then glides down to the next. The five lessons stack under
the last scene, and the film ends back on the family hug.

Vertical frame: at zoom z the camera sees 3840/z by 6827/z world px. A scene is 3600 x 6450.
"""
from engine import BigText, Card, Film

PW = 3600                    # scene width in world px (images are 768 x 1376)
PH = PW * 1376 / 768         # 6450
GAP = 2600                   # room between scenes for clue cards
CORAL = (226, 92, 74)
PURPLE = (124, 78, 168)
GOLD = (222, 160, 40)
INK = (44, 36, 40)
CREAM = (255, 250, 240)


def build_film(doc):
    from engine import Print
    L, E, W = doc.L, doc.E, doc.W
    film = Film(doc.duration, fps=30, look="studio")
    film.look["grain"] = 0.012
    film.look["vignette"] = 0.45

    keys = ["S01", "S02", "S03", "S04", "S05", "S06", "S07", "S08", "S09", "S10", "S11", "S12"]
    Y = {k: i * (PH + GAP) for i, k in enumerate(keys)}
    P = {}
    for k in keys:
        P[k] = film.add(Print(k, 0, Y[k], PW, rot=0.0, t_in=-1, pin=False, border=0.012))

    def fill(t, k, z=1.08, dy=0.0, rot=0.0, strength=0.35):
        film.shot(t, 0, Y[k] + dy, z, rot=rot, radius=3600 / z, strength=strength)

    def scene(k, t0, t1, z0=1.07, z1=1.16, dy0=0.0, dy1=-300.0, rot=0.3):
        fill(t0, k, z0, dy0, rot)
        fill(t1, k, z1, dy1, -rot)

    def clue(n, k, t, rgb):
        y = Y[k] - PH / 2 - GAP / 2
        film.add(BigText(f"CLUE {n}", 0, y + 330, 900, t, rgb=CREAM, bar=rgb, bar_h=0.92, shadow=False, grunge=False, hit=0.7))
        return y

    # 1-2  title, then the family with name tags ------------------------------------------------------
    film.add(BigText("THE REHMAN FAMILY", 0, Y["S01"] - PH / 2 - 1500, 440, 0.2, rgb=INK, shadow=False, grunge=False, type_on=0.6))
    film.add(BigText("TREASURE", 0, Y["S01"] - PH / 2 - 650, 900, 0.9, rgb=CREAM, bar=GOLD, bar_h=0.92, shadow=False, grunge=False, hit=0.8))
    film.shot(0.0, 0, Y["S01"] - PH / 2 - 1000, 0.9, radius=5000, strength=0.15)
    film.shot(1.5, 0, Y["S01"] - PH / 2 - 850, 0.93, radius=5000, strength=0.15)
    scene("S01", L(1) + 1.2, E(1) + 0.3, 1.0, 1.06)
    tags = [("MUM", "Mum", 0.22, 0.34, PURPLE), ("DAD", "Dad", 0.50, 0.26, INK), ("HAMD", "Hamd", 0.80, 0.36, (90, 96, 110)),
            ("AIZAH", "Aizah", 0.41, 0.475, PURPLE), ("JAZAA", "Jazaa", 0.64, 0.50, CORAL)]
    for label, word, fx, fy, rgb in tags:
        x, y = doc.on(P["S01"], fx, fy)
        film.add(BigText(label, x, y, 300, W(2, word) - 0.05, t_out=E(2) + 0.8, rgb=CREAM, bar=rgb, bar_h=0.92, shadow=False, grunge=False, hit=0.35))
    fill(L(2) + 0.3, "S01", 1.06, 300)
    fill(E(2) + 0.2, "S01", 1.08, 350)

    # 3-5  the question and the treasure map ------------------------------------------------------------
    scene("S02", L(3) + 0.3, E(5), 1.06, 1.2, 0, -400)

    # 6-10  clue 1: the kitchen, the supermarket, the clean plate --------------------------------------
    cy = clue(1, "S03", L(6) - 0.1, CORAL)
    film.shot(L(6) + 0.3, 0, cy, 1.25, radius=3000, strength=0.2)
    scene("S03", E(6) + 0.2, E(7), 1.06, 1.16, 0, -350)
    scene("S04", L(8) + 0.3, E(8), 1.06, 1.18, 0, -400, rot=-0.3)
    scene("S05", L(9) + 0.3, E(10), 1.05, 1.22, 0, -500)

    # 11-13  clue 2: the neighbour, sharing lunch ---------------------------------------------------------
    cy = clue(2, "S06", L(11) - 0.1, PURPLE)
    film.shot(L(11) + 0.3, 0, cy, 1.25, radius=3000, strength=0.2)
    scene("S06", W(11, "basket") + 0.1, E(12), 1.06, 1.18, 0, -400)
    scene("S07", L(13) + 0.3, E(13), 1.06, 1.2, 0, -300, rot=-0.3)

    # 14-16  clue 3: walking away, Dad is proud ----------------------------------------------------------
    cy = clue(3, "S08", L(14) - 0.1, (60, 140, 110))
    film.shot(L(14) + 0.3, 0, cy, 1.25, radius=3000, strength=0.2)
    scene("S08", E(14) + 0.2, E(15), 1.06, 1.16, 0, -300)
    scene("S09", L(16) + 0.3, E(16), 1.06, 1.22, 0, -600)

    # 17-19  clue 4: Grandpa's bench --------------------------------------------------------------------
    cy = clue(4, "S10", L(17) - 0.1, GOLD)
    film.shot(L(17) + 0.3, 0, cy, 1.25, radius=3000, strength=0.2)
    scene("S10", E(17) + 0.1, E(19), 1.06, 1.24, 0, 300)

    # 20-21  where is the treasure? -> the family ------------------------------------------------------
    scene("S11", L(20) + 0.3, E(20), 1.06, 1.18, 0, -300)
    scene("S12", L(21) + 0.3, E(21), 1.08, 1.0, -200, 0)

    # 22  the five lessons, under the last scene ---------------------------------------------------------
    y0 = Y["S12"] + PH / 2 + 1300
    lessons = [("SPEND WISELY", "spend", CORAL), ("WASTE NOTHING", "waste", (60, 140, 110)), ("HELP OTHERS", "help", PURPLE),
               ("CHOOSE GOOD FRIENDS", "choose", GOLD), ("RESPECT YOUR ELDERS", "respect", (70, 120, 190))]
    for i, (txt, word, rgb) in enumerate(lessons):
        film.add(BigText(txt, 0, y0 + i * 1000, 460, W(22, word) - 0.1, rgb=CREAM, bar=rgb, bar_h=0.92, shadow=False, grunge=False, hit=0.5))
    mid = y0 + 2 * 1000 - 300
    film.shot(L(22) + 0.2, 0, mid - 500, 0.9, radius=6000, strength=0.15)
    film.shot(E(22), 0, mid - 200, 0.88, radius=6000, strength=0.15)

    # 23  back to the hug ------------------------------------------------------------------------------
    film.add(BigText("LOVE YOUR FAMILY", 0, Y["S12"] - PH / 2 + 1000, 470, W(23, "love") - 0.05, rgb=CREAM, bar=CORAL, bar_h=0.92, shadow=False, grunge=False, hit=0.8))
    fill(L(23) + 0.4, "S12", 1.04, -150)
    film.shot(film.duration, 0, Y["S12"] - 100, 0.98, radius=6000, strength=0.15)
    return film
