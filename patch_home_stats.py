import re

def patch_home_stats():
    with open('client/src/pages/user/Home.jsx', 'r', encoding='utf-8') as f:
        content = f.read()

    old_stats = """  const stats = [
    { value: '15+', label: 'Years distributing pro AV tech' },
    { value: '50+', label: 'Manufacturer brands in portfolio' },
    { value: '3', label: 'Regional operations — India, Africa, Poland' },
    { value: '1M+', label: 'Installs supplied and supported to date' }
  ];"""
    
    new_stats = """  const stats = [
    { value: '15+', label: t('home.stats.years_desc') },
    { value: '50+', label: t('home.stats.brands_desc') },
    { value: '3', label: t('home.stats.ops_desc') },
    { value: '1M+', label: t('home.stats.installs_desc') }
  ];"""
    
    content = content.replace(old_stats, new_stats)

    with open('client/src/pages/user/Home.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Patched Home.jsx stats")

if __name__ == "__main__":
    patch_home_stats()
