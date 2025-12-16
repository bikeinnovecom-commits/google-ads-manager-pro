with open('src/components/Images.tsx', 'r') as f:
    content = f.read()

# Ajouter </button> après Einstellungen
old = '''⚙️Einstellungen
            <button'''

new = '''⚙️Einstellungen
            </button>
            <button'''

content = content.replace(old, new)

with open('src/components/Images.tsx', 'w') as f:
    f.write(content)

print("✅ Corrigé !")
