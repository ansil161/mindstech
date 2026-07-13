import re

def patch_experience():
    with open('client/src/pages/user/Experience.jsx', 'r', encoding='utf-8') as f:
        content = f.read()

    if 'useTranslation' not in content:
        content = content.replace("import Button from '../../components/common/Button/Button.jsx';", "import Button from '../../components/common/Button/Button.jsx';\nimport { useTranslation } from 'react-i18next';")
    
    if 'const { t } = useTranslation();' not in content:
        content = content.replace('const containerRef = useRef(null);', 'const { t } = useTranslation();\n  const containerRef = useRef(null);')

    # Hero
    content = content.replace(">Experience Centre — Bengaluru<", ">{t('experience.hero.label')}<")
    content = content.replace(">Don't imagine it.<", ">{t('experience.hero.line1')}<")
    content = content.replace("><em>Walk into it.</em><", "><em>{t('experience.hero.line2')}</em><")
    content = content.replace(">A hands-on floor where technology meets functionality — live control rooms, collaboration suites, signage and broadcast, running side by side so you can judge them the way your clients will.<", ">{t('experience.hero.desc')}<")
    content = content.replace(">Book a visit<", ">{t('experience.hero.book')}<")
    content = content.replace(">Watch the film<", ">{t('experience.hero.film')}<")
    
    # Meta
    content = content.replace(">6 live zones<", ">{t('experience.meta.zones_b')}<")
    content = content.replace(">Running demos daily<", ">{t('experience.meta.zones_s')}<")
    content = content.replace(">25 brands<", ">{t('experience.meta.brands_b')}<")
    content = content.replace(">On the floor<", ">{t('experience.meta.brands_s')}<")
    content = content.replace(">OMBR Layout<", ">{t('experience.meta.loc_b')}<")
    content = content.replace(">Bangalore, India<", ">{t('experience.meta.loc_s')}<")
    content = content.replace(">By appointment<", ">{t('experience.meta.appt_b')}<")
    content = content.replace(">Guided walkthroughs<", ">{t('experience.meta.appt_s')}<")
    
    # Overview
    content = content.replace(">Overview<", ">{t('experience.ov.label')}<")
    content = content.replace("Spec sheets tell you what a system should do. The Experience Centre shows you what it <em>actually does</em> — live, integrated, and under real conditions.", ">{t('experience.ov.lede')}<")
    content = content.replace(">Our Bengaluru Experience Centre is a dynamic, hands-on environment designed to showcase the power of integrated AV. The floor runs live demonstrations of control room systems, collaborative meeting technologies, digital signage and more — real products from 25 global brands, wired together the way they'd be deployed on site.<", ">{t('experience.ov.p1')}<")
    content = content.replace(">Visitors explore real-world applications, test system interoperability across brands, and work directly with our technical experts. Whether you're a consultant writing a spec, an integrator validating a design, or an enterprise client choosing a standard — this is the shortest path from shortlist to certainty.<", ">{t('experience.ov.p2')}<")

    # Zones
    content = content.replace(">On the floor<", ">{t('experience.zones.label')}<")
    content = content.replace("Six zones. All <em>live.</em>", "Six zones. All <em>{t('experience.zones.title_em')}</em>.")
    content = content.replace(">Explore the solutions we deploy across these verticals.<", ">{t('experience.zones.desc')}<")
    
    # Zones array
    old_zones = """  const zones = [
    { id: '01', slug: 'control-rooms', name: 'Control Room Wall', desc: 'A 24/7-rated video wall driven by live processors — switch sources, split layouts and stress-test the workflow your operators will actually use.', img: '/assets/img/pexels-11783119-w1400.jpg' },
    { id: '02', slug: 'conferencing', name: 'Collaboration Suite', desc: 'A fully wired hybrid meeting room — interactive display, PTZ cameras, ceiling audio and room booking, joined to a real call so you can hear the difference.', img: '/assets/img/pexels-13323673-w1400.jpg' },
    { id: '03', slug: 'digital-signage', name: 'Signage Gallery', desc: 'Indoor LED, professional panels and wayfinding running scheduled content from a live CMS — compare brightness, pitch and processing side by side.', img: '/assets/img/pexels-3402937-w1400.jpg' },
    { id: '04', slug: 'broadcast', name: 'Broadcast Corner', desc: 'Cameras, vision mixing and live graphics in a compact production setup — see a multi-camera stream go from lens to output in one take.', img: '/assets/img/pexels-7865064-w1400.jpg' },
    { id: '05', slug: 'hospitality', name: 'Audio & Hospitality Lounge', desc: 'Invisible and architectural speakers, guest-room IPTV and background audio staged as a lounge — technology that disappears until you press play.', img: '/assets/img/pexels-29870245-w1400.jpg' },
    { id: '06', slug: 'conferencing', name: 'AV-over-IP Backbone', desc: 'The rack room that ties the floor together — AV-over-IP switching, extension and control, so you can trace every signal path end to end.', img: '/assets/img/unsplash-1558494949-ef010cbdcc31-w1400.jpg' }
  ];"""
  
    new_zones = """  const zones = [
    { id: '01', slug: 'control-rooms', name: t('experience.zones_arr.0.name'), desc: t('experience.zones_arr.0.desc'), img: '/assets/img/pexels-11783119-w1400.jpg' },
    { id: '02', slug: 'conferencing', name: t('experience.zones_arr.1.name'), desc: t('experience.zones_arr.1.desc'), img: '/assets/img/pexels-13323673-w1400.jpg' },
    { id: '03', slug: 'digital-signage', name: t('experience.zones_arr.2.name'), desc: t('experience.zones_arr.2.desc'), img: '/assets/img/pexels-3402937-w1400.jpg' },
    { id: '04', slug: 'broadcast', name: t('experience.zones_arr.3.name'), desc: t('experience.zones_arr.3.desc'), img: '/assets/img/pexels-7865064-w1400.jpg' },
    { id: '05', slug: 'hospitality', name: t('experience.zones_arr.4.name'), desc: t('experience.zones_arr.4.desc'), img: '/assets/img/pexels-29870245-w1400.jpg' },
    { id: '06', slug: 'conferencing', name: t('experience.zones_arr.5.name'), desc: t('experience.zones_arr.5.desc'), img: '/assets/img/unsplash-1558494949-ef010cbdcc31-w1400.jpg' }
  ];"""
    content = content.replace(old_zones, new_zones)
    
    # Film Section
    content = content.replace(">See it in action.<", ">{t('experience.film.title')}<")
    content = content.replace(">Take a quick tour of the floor.<", ">{t('experience.film.desc')}<")
    content = content.replace(">Play film<", ">{t('experience.film.play')}<")
    
    # CTA
    content = content.replace(">Visit us<", ">{t('experience.cta.label')}<")
    content = content.replace(">Walk the floor.<", ">{t('experience.cta.line1')}<")
    content = content.replace(">Test the tech.<", ">{t('experience.cta.line2')}<")
    
    with open('client/src/pages/user/Experience.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Patched Experience.jsx")

if __name__ == "__main__":
    patch_experience()
