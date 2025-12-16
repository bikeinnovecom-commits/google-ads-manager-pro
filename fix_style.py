with open('src/components/Images.tsx', 'r') as f:
    content = f.read()

old_button = '''<button
              onClick={() => setActiveTab("performance")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === "performance"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              ⚡ Performance
            </button>'''

new_button = '''<button
              className={`tab ${activeTab === 'performance' ? 'active' : ''}`}
              onClick={() => setActiveTab('performance')}
            >
              ⚡ Performance
            </button>'''

content = content.replace(old_button, new_button)

with open('src/components/Images.tsx', 'w') as f:
    f.write(content)

print("✅ Style corrigé !")
