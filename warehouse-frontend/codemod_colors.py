from pathlib import Path
root = Path(r"C:/Users/nours/Desktop/Warehouse Pfe")
frontend = root / "warehouse-frontend"
paths = sorted(set(list((frontend / "src").rglob("*.tsx")) + list((frontend / "app").rglob("*.tsx"))))
repls = [
("focus:border-[#f0c040]","focus:border-[var(--role-admin)]"),
("bg-[#f0c040]","bg-[var(--role-admin)]"),("text-[#f0c040]","text-[var(--role-admin)]"),("border-[#f0c040]","border-[var(--role-admin)]"),
("bg-[#4af0a0]","bg-[var(--role-manager)]"),("text-[#4af0a0]","text-[var(--role-manager)]"),("border-[#4af0a0]","border-[var(--role-manager)]"),
("bg-[#4aa0f0]","bg-[var(--role-customer)]"),("text-[#4aa0f0]","text-[var(--role-customer)]"),("border-[#4aa0f0]","border-[var(--role-customer)]"),
("bg-[#2f4f2f]","bg-[var(--color-success)]"),("border-[#2f4f2f]","border-[var(--color-success)]"),("text-[#8fe38f]","text-[var(--color-success)]"),
("bg-[#5a1f1f]","bg-[var(--color-error)]"),("border-[#5a1f1f]","border-[var(--color-error)]"),("text-[#ff9f9f]","text-[var(--color-error)]"),
("bg-[#4b3f21]","bg-[var(--color-warning)]"),("border-[#4b3f21]","border-[var(--color-warning)]"),("text-[#f0c978]","text-[var(--color-warning)]"),
("bg-[#24405a]","bg-[var(--color-info)]"),("border-[#24405a]","border-[var(--color-info)]"),("text-[#8ecfff]","text-[var(--color-info)]"),
("bg-[#0a0a0a]","bg-black"),("bg-[#101010]","bg-gray-950"),("bg-[#111]","bg-gray-950"),("bg-[#0f0f0f]","bg-gray-950"),("bg-[#0d0d0d]","bg-gray-950"),("bg-[#0b0b0b]","bg-black"),
("border-[#1a1a1a]","border-gray-900"),("border-[#1b1b1b]","border-gray-900"),("border-[#1c1c1c]","border-gray-900"),("border-[#222]","border-gray-800"),("border-[#2a2a2a]","border-gray-800"),("border-[#2b2b2b]","border-gray-800"),("border-[#3a3a3a]","border-gray-700"),
("text-[#333]","text-gray-700"),("text-[#555]","text-gray-500"),("text-[#666]","text-gray-500"),("text-[#777]","text-gray-400"),("text-[#888]","text-gray-400"),("text-[#aaa]","text-gray-300"),("text-[#bbb]","text-gray-300"),("text-[#ccc]","text-gray-200"),("text-[#ddd]","text-gray-200"),("text-[#d7d7d7]","text-gray-200"),("text-[#d8d8d8]","text-gray-200")
]
role_repls = [("\"#f0c040\"","\"var(--role-admin)\""),("\"#4af0a0\"","\"var(--role-manager)\""),("\"#4aa0f0\"","\"var(--role-customer)\"")]
changed = []
total = 0
for p in paths:
    old = p.read_text(encoding="utf-8")
    new = old
    for a,b in repls:
        c = new.count(a)
        if c:
            new = new.replace(a,b)
            total += c
    low = str(p).lower()
    if "/app/" in low.replace("\\","/") and ("profile" in low or "wrapper" in low):
        for a,b in role_repls:
            c = new.count(a)
            if c:
                new = new.replace(a,b)
                total += c
    if new != old:
        p.write_text(new,encoding="utf-8")
        changed.append(str(p.relative_to(root)).replace('\\','/'))
print("CHANGED_FILES")
for c in sorted(changed):
    print(c)
print("TOTAL_REPLACEMENTS")
print(total)
print("FILES_CHANGED_COUNT")
print(len(changed))
