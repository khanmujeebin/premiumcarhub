"""The Australia Renewal Series: a vertical (9:16) launch film for two books by Mujeeb Ur Rehman.

One column of clusters, top to bottom, joined by a gold line the camera follows:
  A  the squeeze (typed hook)          y ~ 0
  B  the author                        y ~ 6500
  C  Book 1: Hope Without Illusions    y ~ 12500
  D  Book 2: Australian Economy Under Pressure, and what is inside   y ~ 21000 .. 35000
  E  Book 2 back cover: bio, then the headline                      y ~ 41000
  F  both covers together under the series name                     y ~ 48500

Vertical frame: at zoom z the camera sees 3840/z by 6827/z world px.
"""
from engine import BigText, Card, Counter, Film, PenMark, Print, Route, Stamp

GOLD = (214, 170, 62)
ORANGE = (242, 163, 51)
CREAM = (246, 242, 232)
NAVY = (22, 30, 48)


def build_film(doc):
    L, E, W = doc.L, doc.E, doc.W
    film = Film(doc.duration, fps=30, look="night")
    film.look["glow"] = 0.22

    def shot(t, x, y, z, rot=0.0, strength=0.5):
        film.shot(t, x, y, z, rot=rot, radius=2300 / z, strength=strength)

    def spine(y0, y1, t, dur=0.8):
        film.add(Route((0, y0), (0, y1), t_in=t, dur=dur, bend=0.0, width=26, rgb=GOLD))

    # A  the squeeze -------------------------------------------------------------------------------
    film.add(BigText("HIRING SLOWS", 0, -1450, 690, W(1, "Hiring") - 0.05, rgb=CREAM, hit=0.6))
    film.add(BigText("RATES RISE", 0, -550, 690, W(1, "Rates") - 0.05, rgb=ORANGE, hit=0.7))
    film.add(BigText("THE MATHS", 0, 1700, 700, L(2) + 0.1, rgb=CREAM))
    film.add(BigText("NO LONGER ADDS UP", 0, 2500, 440, W(2, "adds") - 0.15, rgb=NAVY, bar=ORANGE, bar_h=0.92, shadow=False, hit=0.8))
    shot(0.0, 0, -1050, 0.92)
    shot(W(1, "Rates"), 0, -950, 1.0, rot=-0.5)
    shot(E(1) - 0.2, 0, -700, 1.02, rot=0.3)
    shot(L(2) + 0.4, 0, 2000, 1.0)
    shot(E(2) - 0.1, 0, 2150, 1.06, rot=-0.4)

    # B  the author --------------------------------------------------------------------------------
    spine(3000, 4900, L(3) - 0.3, dur=0.7)
    au = film.add(Print("AU", 0, 6500, 3500, rot=-1.0, t_in=L(3) - 0.15, pin=False, border=0.012))
    shot(L(3) + 0.35, 0, 6400, 1.0, rot=-0.6)
    shot(E(3) + 0.3, 0, 6550, 1.12, rot=-0.2)

    # C  Book 1 ------------------------------------------------------------------------------------
    spine(8450, 9700, L(4) - 0.5, dur=0.6)
    film.add(BigText("BOOK 1", 0, 9950, 380, L(4) - 0.1, rgb=GOLD))
    b1 = film.add(Print("B1", 0, 12700, 3000, rot=0.8, t_in=L(4) - 0.1, pin=False, border=0.01))
    shot(L(4) + 0.4, 0, 12000, 0.98, rot=0.4)
    for word, y, rgb in (("jobs", 15900, CREAM), ("resilience", 16520, CREAM), ("affordability", 17140, GOLD)):
        film.add(BigText(word.upper(), 0, y, 520, W(5, word) - 0.1, rgb=rgb, hit=0.5))
    shot(L(5) + 0.3, 0, 14700, 0.92)
    shot(E(5) - 0.1, 0, 15300, 0.94, rot=-0.3)
    sx, sy = doc.on(b1, 0.345, 0.352)
    film.add(PenMark("underline", sx, sy, 1700, 40, t_in=W(6, "infrastructure") - 0.1, dur=0.9, width=22, rgb=GOLD))
    cx, cy = doc.on(b1, 0.42, 0.24)
    shot(L(6) + 0.5, cx, cy, 1.35, rot=0.5)
    shot(E(6), cx + 60, cy + 120, 1.45, rot=0.6)
    sx, sy = doc.on(b1, 0.5, 0.64)
    film.add(Stamp("AVAILABLE NOW", sx, sy, size=380, rot=-9, t_in=W(7, "Amazon") - 0.05, rgb=(226, 72, 40)))
    shot(L(7) + 0.1, 0, 12650, 0.92, rot=0.2)
    shot(E(7) + 0.8, 0, 12750, 0.95)

    # D  Book 2 ------------------------------------------------------------------------------------
    spine(17450, 17950, L(8) - 0.2, dur=0.5)                      # down past the words to Book 2
    film.add(BigText("BOOK 2", 0, 18350, 380, W(8, "book") - 0.05, rgb=ORANGE))
    b2 = film.add(Print("B2", 0, 21250, 3000, rot=-0.8, t_in=W(8, "two") - 0.1, pin=False, border=0.01))
    shot(L(8) + 0.6, 0, 18600, 0.82)
    shot(L(9) + 0.3, 0, 21000, 0.98, rot=-0.3)
    shot(E(9) + 0.5, 0, 21150, 1.04, rot=-0.5)

    film.add(Counter(0, 25500, 1500, 5, W(10, "five") - 0.1, dur=0.8, caption="RATE RISES IN 2026", rgb=ORANGE))
    shot(L(10) + 0.3, 0, 25100, 1.05, rot=0.4)
    shot(E(10), 0, 25200, 1.12, rot=0.2)

    film.add(BigText("COUNCIL RATES", 0, 27500, 560, W(11, "council") - 0.1, rgb=CREAM))
    film.add(BigText("UP", 0, 28100, 560, W(11, "rising") - 0.1, rgb=NAVY, bar=ORANGE, bar_h=0.92, shadow=False, hit=0.6))
    film.add(BigText("HOME VALUE", 0, 28900, 560, W(11, "home") - 0.1, rgb=CREAM))
    film.add(BigText("DOWN", 0, 29500, 560, W(11, "less") - 0.1, rgb=NAVY, bar=ORANGE, bar_h=0.92, shadow=False, hit=0.6))
    shot(L(11) + 0.3, 0, 28300, 1.02, rot=-0.4)
    shot(E(11), 0, 28500, 1.06)

    for name, y, word in (("SNOWY 2.0", 31300, "snowy"), ("INLAND RAIL", 32400, "inland"), ("SYDNEY LIGHT RAIL", 33500, "sydney")):
        film.add(Card(0, y, 3300, 900, W(12, word) - 0.15, title=name, rgb=NAVY, text_rgb=CREAM, accent=ORANGE, title_size=230))
    film.add(Stamp("WORLD-CLASS?", 200, 32400, size=440, rot=-10, t_in=W(12, "promises") - 0.05, rgb=(238, 70, 46)))
    shot(L(12) + 0.3, 0, 32100, 0.94, rot=0.4)
    shot(E(12), 0, 32400, 0.97, rot=-0.2)

    film.add(Counter(0, 36000, 1500, 90, W(13, "ninety") - 0.1, dur=0.9, caption="DAYS  ·  WORKSHEETS", rgb=GOLD))
    shot(L(13) + 0.3, 0, 35600, 1.05)
    shot(E(13) + 0.6, 0, 35750, 1.1, rot=0.3)

    # E  back cover: the author's record, then the headline -------------------------------------------
    spine(37000, 38300, L(14) - 0.6, dur=0.7)
    bk = film.add(Print("BK", 0, 41000, 3200, rot=0.6, t_in=L(14) - 0.3, pin=False, border=0.01))
    bx, by = doc.on(bk, 0.47, 0.64)
    shot(L(14) + 0.2, bx, by, 1.08, rot=0.3)
    shot(E(14), bx, by - 100, 1.14, rot=0.5)
    hx, hy = doc.on(bk, 0.3, 0.16)
    shot(L(15) + 0.35, hx, hy, 1.55, rot=-0.4)
    shot(W(15, "way") + 0.1, hx, hy + 150, 1.62, rot=-0.6)
    film.shake(W(15, "way"), 10, 0.35)
    shot(E(15) + 0.5, hx, hy + 250, 1.6, rot=-0.5)

    # F  both books, the series ----------------------------------------------------------------------
    spine(43600, 46000, L(16) - 0.4, dur=0.6)
    film.add(BigText("THE AUSTRALIA RENEWAL SERIES", 0, 46450, 340, L(16) - 0.1, rgb=GOLD, rules=False, hit=0.6))
    film.add(Print("B1", -1000, 48500, 1800, rot=-1.5, t_in=L(16) - 0.05, pin=False, border=0.01))
    film.add(Print("B2", 1000, 48500, 1800, rot=1.5, t_in=W(16, "Australian") - 0.1, pin=False, border=0.01))
    film.add(BigText("BOOK 1  ·  OUT NOW", -1000, 50350, 260, W(16, "Amazon"), rgb=CREAM))
    film.add(BigText("BOOK 2  ·  THIS WEEK", 1000, 50350, 260, W(16, "launches"), rgb=ORANGE))
    shot(L(16) + 0.4, 0, 48200, 0.98, strength=0.35)
    shot(E(16), 0, 48350, 0.93, strength=0.25)
    shot(film.duration, 0, 48400, 0.9, strength=0.2)
    return film
