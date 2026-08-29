"""
Bakes public/img/clients/* into public/img/clients-mono/* for the client grid.

Run with Pillow installed:  python3 scripts/normalise-client-logos.py

The client logos arrive as full-colour artwork at wildly different aspect
ratios (7.32:1 to 0.82:1) and ink luminances (51 to 198) — half of them are
invisible on the #070809 background and no single CSS filter fixes that, since
each needs its own contrast curve. So the normalisation is baked into the
asset instead:

1. Knock out any baked-in light plate. Two logos ship their background inside
   the alpha channel, which makes a silhouette treatment fill the whole shape —
   Top Glove became a white slab and Serandu a white disc.
2. Trim to the ink's real bounding box.
3. Greyscale, autocontrast per logo, then lift into 120-255 so even the darkest
   ink clears the background while internal detail survives. A flat silhouette
   destroys the government crests.
4. Scale by INK AREA rather than bounding box, so a long wordmark and a compact
   crest read at the same visual weight, and centre on one uniform canvas.

Output is therefore drop-in: the grid needs no per-logo overrides.
"""

from PIL import Image, ImageOps
import glob
import math
import os

SRC = 'public/img/clients'
OUT = 'public/img/clients-mono'
CANVAS = (460, 208)  # 2x the 230x104 grid cell
FLOOR = 0.62         # smallest an outlier may be scaled, so nothing vanishes
INK_FLOOR = 120      # darkest permitted ink on #070809


def knock_out_plate(im):
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a > 0 and r > 238 and g > 238 and b > 238:
                px[x, y] = (r, g, b, 0)
    return im


def tone(im):
    alpha = im.getchannel('A')
    grey = ImageOps.autocontrast(ImageOps.grayscale(im.convert('RGB')), cutoff=1)
    grey = grey.point(lambda v: int(INK_FLOOR + v * (255 - INK_FLOOR) / 255))
    out = grey.convert('RGBA')
    out.putalpha(alpha)
    return out


def ink_pixels(im):
    return sum(1 for v in im.getchannel('A').getdata() if v > 40)


def main():
    os.makedirs(OUT, exist_ok=True)
    prepared = []
    for path in sorted(glob.glob(f'{SRC}/*')):
        im = Image.open(path).convert('RGBA')
        im = knock_out_plate(im)
        box = im.getchannel('A').getbbox()
        if box:
            im = im.crop(box)
        im = tone(im)
        probe = im.copy()
        probe.thumbnail(CANVAS, Image.LANCZOS)
        prepared.append((path, im, ink_pixels(probe)))

    target = sorted(p[2] for p in prepared)[len(prepared) // 2]

    for path, im, ink in prepared:
        k = max(FLOOR, min(1.0, math.sqrt(target / max(ink, 1))))
        fitted = im.copy()
        fitted.thumbnail((int(CANVAS[0] * k), int(CANVAS[1] * k)), Image.LANCZOS)
        canvas = Image.new('RGBA', CANVAS, (255, 255, 255, 0))
        canvas.paste(
            fitted,
            ((CANVAS[0] - fitted.width) // 2, (CANVAS[1] - fitted.height) // 2),
            fitted,
        )
        name = os.path.splitext(os.path.basename(path))[0]
        canvas.save(f'{OUT}/{name}.png')
        print(f'{name:<10} scale={k:.2f}')


if __name__ == '__main__':
    main()
