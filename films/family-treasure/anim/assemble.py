"""Assemble the animated version: each scene's HeyGen clip, fitted to its dialogue span, with the
character voices from audio/narration.m4a and title / clue / lesson text burned on.

  python3 anim/assemble.py   (run from films/family-treasure)
"""
import json, subprocess, pathlib
P = pathlib.Path(__file__).resolve().parent
ROOT = P.parent
plan = json.loads((P / "plan.json").read_text())
timing = {s["id"]: s for s in json.loads((ROOT / "audio/timing.json").read_text())["segments"]}
FONT = str(ROOT / "fonts/cond.ttf")
W, H, FPS = 1080, 1920, 30

parts = []
for k, v in plan.items():
    src = P / f"{k}_raw.mp4"
    out = P / f"{k}_fit.mp4"
    d = v["dur"]
    # fill 1080x1920 (clips are 1080x1890), hold the last frame if the clip is shorter than the dialogue
    vf = (f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS},"
          f"tpad=stop_mode=clone:stop_duration=30,trim=duration={d},setpts=PTS-STARTPTS,format=yuv420p")
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(src), "-an", "-vf", vf,
                    "-c:v", "libx264", "-crf", "18", "-preset", "veryfast", str(out)], check=True)
    parts.append(out)

(P / "concat.txt").write_text("".join(f"file '{p}'\n" for p in parts))
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(P / "concat.txt"),
                "-c", "copy", str(P / "joined.mp4")], check=True)

def box(text, t0, t1, y, size, color, fade=0.25):
    alpha = f"if(lt(t,{t0}+{fade}),(t-{t0})/{fade},if(gt(t,{t1}-{fade}),({t1}-t)/{fade},1))"
    return (f"drawtext=fontfile='{FONT}':text='{text}':fontsize={size}:fontcolor=white:alpha='{alpha}':"
            f"box=1:boxcolor={color}@0.92:boxborderw=24:x=(w-text_w)/2:y={y}:enable='between(t,{t0},{t1})'")

L = lambda i: timing[i]["start"]
E = lambda i: timing[i]["end"]
f = [box("THE REHMAN FAMILY TREASURE", 0.3, E(2), 150, 92, "0xDEA028")]
for n, line, col in ((1, 6, "0xE25C4A"), (2, 11, "0x7C4EA8"), (3, 14, "0x3C8C6E"), (4, 17, "0xDEA028")):
    f.append(box(f"CLUE {n}", L(line) - 0.1, E(line) + 0.4, 170, 150, col))
lessons = [("SPEND WISELY", "0xE25C4A"), ("WASTE NOTHING", "0x3C8C6E"), ("HELP OTHERS", "0x7C4EA8"),
           ("CHOOSE GOOD FRIENDS", "0xDEA028"), ("RESPECT YOUR ELDERS", "0x4678BE")]
span = (E(22) - L(22)) / len(lessons)
for i, (txt, col) in enumerate(lessons):
    f.append(box(txt, L(22) + i * span, E(22) + 0.3, 260 + i * 130, 84, col))
f.append(box("LOVE YOUR FAMILY", L(23), plan["S12"]["end"], 170, 120, "0xE25C4A"))

total = sum(v["dur"] for v in plan.values())
af = f"afade=t=out:st={total - 1.5}:d=1.5"
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(P / "joined.mp4"), "-i", str(ROOT / "audio/narration.m4a"),
                "-filter_complex", f"[0:v]{','.join(f)},fade=t=in:st=0:d=0.6,fade=t=out:st={total - 1.5}:d=1.5[v];[1:a]{af}[a]",
                "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "22", "-preset", "slow", "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-shortest",
                str(ROOT / "out/family_treasure_animated.mp4")], check=True)
print("wrote", ROOT / "out/family_treasure_animated.mp4")
