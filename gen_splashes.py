import json
import random

random.seed(42)

# Handwritten, genuinely varied splash lines
handwritten = [
"probably not spyware!",
"now with 100% more starfield!",
"your uptime is longer than mine.",
"the weather widget is not paid promotion.",
"still faster than Roblox loading screens!",
"star count intentionally unverified.",
"running on hopes and Node.js!",
"no ads, no tracking, just vibes.",
"refresh rate: whenever you feel like it.",
"this splash changes more than your sleep schedule.",
"404: motivation not found.",
"black background, white text, zero chill.",
"cracked open like a Roblox exploit patch note.",
"deployed at 2am, questioned at 3am.",
"more stable than my sleep schedule.",
"space is big. this canvas element is smaller.",
"weather forecast: probably accurate.",
"friend count updates faster than mine irl.",
"self-hosted, self-roasted.",
"built different (mostly out of spite).",
"loading personality... please wait.",
"tabs open: too many to count.",
"this page has seen things.",
"powered by caffeine and stubbornness.",
"one commit away from breaking everything.",
"technically a website, spiritually a mood.",
"the stars don't judge your code.",
"cloud coverage: also known as your GitHub commits.",
"render.com carried this whole project.",
"not affiliated with NASA (yet).",
"splash text #237 out of 500. keep scrolling.",
"clock's ticking, deadlines aren't.",
"free real estate for your desktop.",
"this is the good kind of black screen of death.",
"friendly reminder: touch grass eventually.",
"you vs the wallpaper you were told not to worry about.",
"weather.exe has stopped judging your life choices.",
"the void stares back, politely.",
"main character energy, side character budget.",
"currently orbiting your taskbar.",
"deployed with more confidence than testing.",
"star field brought to you by canvas and vibes.",
"green flag: this dashboard actually works.",
"red flag: you built this at 1am.",
"loading Denton, NC forecast responsibly.",
"friend requests pending since forever.",
"probably online right now.",
"no cap, this splash text is bussin (regrettably).",
"cracked the code, still can't crack my sleep schedule.",
"achievement unlocked: personal dashboard.",
"error 200: everything's actually fine.",
"you found the easter egg. there is no prize.",
"this message was rotated in from 499 others.",
"astronomy major dropout energy.",
"the stars twinkle, unlike your motivation.",
"desktop wallpaper with a better work ethic than you.",
"probably outlives your current git branch.",
"one part dashboard, one part shrine.",
"weather advisory: might just be vibes outside.",
"your Roblox stats, immortalized in a webpage.",
"back by popular demand (mine).",
"more reliable uptime than most APIs.",
"still not a virus. still gets flagged as one.",
"connection status: mysteriously stable.",
"friendly neighborhood dashboard.",
"the void needed a UI.",
"quietly judging your tab count.",
"star density: purely decorative.",
"weather data may be more accurate than my mood.",
"another day, another splash text.",
"consider this your daily reminder to hydrate.",
"the roblox api has seen better days.",
"deployed once, forgotten thrice, revived now.",
"this dashboard runs on spite and node_modules.",
"local time: whatever your clock says.",
"friend count go brrr (allegedly).",
"a black hole for your free time.",
"powered by 500 mildly unhinged one-liners.",
"cosmic background radiation, but make it aesthetic.",
"the weather said rain. the weather lied before.",
"github contributions graph would like a word.",
"one server call away from chaos.",
"night mode was never a choice, only a lifestyle.",
"star field rendered client-side, feelings rendered nowhere.",
"probably the coolest thing running on your desktop right now.",
"if you're reading this, refresh the page.",
"weather widget powered by wttr.in and hope.",
"the true measure of uptime is dedication.",
"friend count: still counting.",
"splash text generator ran out of Minecraft nostalgia, wrote this instead.",
"somewhere between a dashboard and a personality test.",
"denton nc represent.",
"the stars are just CSS with commitment issues.",
"loading screen for real life, essentially.",
"congratulations, you now know the weather.",
"a monument to procrastination, tastefully rendered.",
"the API rate limit fears you.",
"cache invalidated. so is your excuse for not sleeping.",
"this page loads faster than my motivation in the morning.",
"star map accuracy: astronomically low.",
"clock's still ticking. so is the deploy timer.",
"weather forecast brought to you by educated guessing.",
"one dashboard to rule your desktop.",
"friendly reminder that the void is well-lit tonight.",
"deploy logs say everything's fine. trust the logs.",
"a wallpaper with more uptime than your favorite server.",
"splash text roulette: you got this one.",
"the stars twinkle because the CSS animation says so.",
"weather app rejected, personal weather API accepted.",
"back at it again with the pitch-black background.",
]

# Dedup + ensure count baseline
handwritten = list(dict.fromkeys(handwritten))

# Template-based generator for volume + variety, all original phrasing
subjects = ["this dashboard", "the starfield", "your uptime", "the weather widget", "this splash text",
            "the roblox preview", "the clock", "node.js", "this render deploy", "the void",
            "your friend count", "the api", "this pixel", "denton nc", "the css animation",
            "the cache", "your desktop", "this webpage", "the server", "your commit history"]

verbs = ["never sleeps", "runs on vibes", "judges silently", "keeps ticking", "refuses to crash",
         "loads eventually", "twinkles on command", "updates when it feels like it",
         "outperforms expectations", "quietly persists", "does its best", "stays online",
         "won't back down", "keeps the lights on", "holds it together", "just works (mostly)",
         "never asked for this", "carries the whole page", "stayed up past bedtime",
         "deserves a raise"]

adjs = ["probably fine", "surprisingly stable", "questionably deployed", "aggressively black",
        "quietly cracked", "mildly unhinged", "weirdly wholesome", "oddly comforting",
        "unnecessarily dramatic", "low-key impressive", "not up for debate", "kind of iconic",
        "built with love (and bugs)", "somehow still running", "self-aware", "chronically online",
        "extremely Denton, NC coded", "not a virus, promise", "definitely a feature",
        "written at 2am and proud of it"]

templates = [
    "{s} {v}.",
    "{s} is {a}.",
    "warning: {s} {v}.",
    "fun fact: {s} is {a}.",
    "{s}, {a}, unbothered.",
    "status update: {s} {v}.",
    "{s} said 'trust the process' and {v}.",
]

generated = set()
attempts = 0
while len(generated) < (500 - len(handwritten)) and attempts < 20000:
    attempts += 1
    t = random.choice(templates)
    s = random.choice(subjects)
    v = random.choice(verbs)
    a = random.choice(adjs)
    line = t.format(s=s, v=v, a=a)
    if line not in handwritten:
        generated.add(line)

final = handwritten + list(generated)
final = list(dict.fromkeys(final))  # final dedup safety
random.shuffle(final)
final = final[:500]

print(f"Total splash lines: {len(final)}")

with open('/home/claude/patrick-dashboard/data/splashes.json', 'w') as f:
    json.dump(final, f, indent=2)
