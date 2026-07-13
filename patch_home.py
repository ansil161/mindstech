import re

def patch_file():
    with open('client/src/pages/user/Home.jsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add useDynamicTranslation hook import
    if 'useDynamicTranslation' not in content:
        content = content.replace("import { useTranslation } from 'react-i18next';", "import { useTranslation } from 'react-i18next';\nimport useDynamicTranslation from '../../hooks/useDynamicTranslation';")

    # 2. Add useDynamicTranslation hook inside component
    if 'const translateDynamic = useDynamicTranslation();' not in content:
        content = content.replace('const { t } = useTranslation();', 'const { t } = useTranslation();\n  const translateDynamic = useDynamicTranslation();')

    # 3. Patch fetchSolutions
    old_solutions = '''        if (res.data && res.data.length > 0) {
          setSolutions(res.data);
        }'''
    new_solutions = '''        if (res.data && res.data.length > 0) {
          const translated = await translateDynamic(res.data, ['title', 'desc']);
          setSolutions(translated);
        }'''
    content = content.replace(old_solutions, new_solutions)

    # 4. Patch fetchFieldwork
    old_fieldwork = '''        if (res.data && res.data.length > 0) {
          setFieldwork(res.data);
        }'''
    new_fieldwork = '''        if (res.data && res.data.length > 0) {
          const translated = await translateDynamic(res.data, ['title', 'location_meta', 'category']);
          setFieldwork(translated);
        }'''
    content = content.replace(old_fieldwork, new_fieldwork)

    # 5. Patch edgeItems
    old_edge = """  const edgeItems = [
    { title: 'A portfolio built over fifteen years', desc: 'We represent more than fifty manufacturers — Crestron to Samsung Professional — chosen so that an integrator can specify an entire project from one price list. No gaps, no grey imports.', visual: '/assets/img/unsplash-1486406146926-c627a92ad1ab-w1100.jpg', caption: 'Brand network' },
    { title: 'Engineers, not order-takers', desc: "Every category we carry has a product specialist behind it. We do system design reviews, run demos from our own stock, and stay on the escalation path long after the invoice is paid.", visual: '/assets/img/pexels-33966530-w1100.jpg', caption: 'Technical depth' },
    { title: 'Local teams in three markets', desc: 'Bangalore covers India and the SAARC region, our Africa office serves the continent\\'s commercial hubs, and Warsaw handles Central and Eastern Europe — local currency, local warranty, local people.', visual: '/assets/img/unsplash-1522071820081-009f0129c71c-w1100.jpg', caption: 'Regional teams' },
    { title: 'Support from enquiry to install', desc: 'Pre-sales consultation, procurement, logistics, commissioning help and after-sales service under one roof. Each partner gets a named account manager and a direct line to technical staff.', visual: '/assets/img/unsplash-1504384308090-c894fdcc538d-w1100.jpg', caption: 'End-to-end support' },
  ];"""
    
    new_edge = """  const edgeItems = [
    { title: t('home.edgeItems.0.title'), desc: t('home.edgeItems.0.desc'), visual: '/assets/img/unsplash-1486406146926-c627a92ad1ab-w1100.jpg', caption: t('home.edgeItems.0.caption') },
    { title: t('home.edgeItems.1.title'), desc: t('home.edgeItems.1.desc'), visual: '/assets/img/pexels-33966530-w1100.jpg', caption: t('home.edgeItems.1.caption') },
    { title: t('home.edgeItems.2.title'), desc: t('home.edgeItems.2.desc'), visual: '/assets/img/unsplash-1522071820081-009f0129c71c-w1100.jpg', caption: t('home.edgeItems.2.caption') },
    { title: t('home.edgeItems.3.title'), desc: t('home.edgeItems.3.desc'), visual: '/assets/img/unsplash-1504384308090-c894fdcc538d-w1100.jpg', caption: t('home.edgeItems.3.caption') },
  ];"""
    
    content = content.replace(old_edge, new_edge)
    
    with open('client/src/pages/user/Home.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Patched Home.jsx")

if __name__ == "__main__":
    patch_file()
