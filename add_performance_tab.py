import re

with open('src/components/Images.tsx', 'r') as f:
    content = f.read()

# 1. Ajouter 'performance' au type useState
content = content.replace(
    "'settings'>('overview')",
    "'settings' | 'performance'>('overview')"
)

# 2. Ajouter import PerformanceOptimizer après le dernier import
content = content.replace(
    "import './Images.css'",
    "import './Images.css'\nimport PerformanceOptimizer from './PerformanceOptimizer'"
)

# 3. Ajouter le bouton Performance après Einstellungen (dans les tabs)
content = content.replace(
    '''⚙️ Einstellungen
            </button>
          </div>''',
    '''⚙️ Einstellungen
            </button>
            <button
              className={`tab ${activeTab === 'performance' ? 'active' : ''}`}
              onClick={() => setActiveTab('performance')}
            >
              ⚡ Performance
            </button>
          </div>'''
)

# 4. Ajouter le rendu du composant Performance après Settings
content = content.replace(
    '''{/* Performance Tab */}''',
    ''
)
content = content.replace(
    '''{activeTab === 'performance' && <PerformanceOptimizer />}''',
    ''
)

# Ajouter le rendu avant la dernière </div> du composant
settings_pattern = r"(\{activeTab === 'settings' && !loading && \([\s\S]*?\)\}\s*\n\s*</div>\s*\n\s*\);\s*\n\};)"
settings_replacement = r"{activeTab === 'settings' && !loading && (\n" + \
    r"          <!-- settings content -->\n" + \
    r"        )}\n\n" + \
    r"          {activeTab === 'performance' && <PerformanceOptimizer />}\n" + \
    r"        </div>\n" + \
    r"  );\n" + \
    r"};"

# Approche plus simple: trouver où ajouter le rendu Performance
if "{activeTab === 'performance'" not in content:
    # Chercher la fin du bloc settings et ajouter après
    content = re.sub(
        r"(\{activeTab === 'settings' && !loading && \([\s\S]*?</div>\s*\n\s*</div>\s*\n\s*\)\})",
        r"\1\n\n          {activeTab === 'performance' && <PerformanceOptimizer />}",
        content
    )

with open('src/components/Images.tsx', 'w') as f:
    f.write(content)

print("✅ Modifications appliquées!")
