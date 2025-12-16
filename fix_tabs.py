import re

with open('src/components/Images.tsx', 'r') as f:
    content = f.read()

# Trouver et remplacer la section cassée
old_pattern = r"⚙️Einstellungen\n\s*<button\s+onClick=\{\(\) => setActiveTab\(\"performance\"\)\}\s+className=\{[^}]+\}\s*>\s*⚡ Performance\s*</button>\s*</button>"

new_code = """⚙️Einstellungen
            </button>
            <button
              className={\`tab \${activeTab === 'performance' ? 'active' : ''}\`}
              onClick={() => setActiveTab('performance')}
            >
              ⚡ Performance
            </button>"""

content = re.sub(old_pattern, new_code, content, flags=re.DOTALL)

with open('src/components/Images.tsx', 'w') as f:
    f.write(content)

print("✅ Tabs corrigés !")
