import sys, pathlib
from playwright.sync_api import sync_playwright
T=float(sys.argv[1]); out=pathlib.Path(sys.argv[2]); out.mkdir(exist_ok=True)
only=[float(x) for x in sys.argv[3].split(",")] if len(sys.argv)>3 else None
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium"); pg=b.new_page(viewport={"width":1080,"height":1920})
    pg.goto(pathlib.Path("reel.html").resolve().as_uri()); pg.wait_for_timeout(1500)
    ts=only or [i/30 for i in range(int(T*30))]
    for n,t in enumerate(ts):
        pg.evaluate(f"seek({t})")
        pg.screenshot(path=str(out/(f"c-{t:05.1f}.png" if only else f"f{n:04d}.jpg")),**({} if only else {"type":"jpeg","quality":93}))
    b.close()
print("done",len(ts))
