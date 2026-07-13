import re

def patch_solutions():
    with open('client/src/pages/user/Solutions.jsx', 'r', encoding='utf-8') as f:
        content = f.read()

    if 'useTranslation' not in content:
        content = content.replace("import Button from '../../components/common/Button/Button.jsx';", "import Button from '../../components/common/Button/Button.jsx';\nimport { useTranslation } from 'react-i18next';")
    
    if 'const { t } = useTranslation();' not in content:
        content = content.replace('const containerRef = useRef(null);', 'const { t } = useTranslation();\n  const containerRef = useRef(null);')

    # Hero
    content = content.replace(">Every vertical.<", ">{t('solutions.hero.line1')}<")
    content = content.replace("><em>One partner.</em><", "><em>{t('solutions.hero.line2')}</em><")
    content = content.replace(">Solutions<", ">{t('solutions.hero.label')}<")
    content = content.replace(">From a single meeting room to a national command centre — six AV verticals, one price list, and product specialists behind every category we distribute.<", ">{t('solutions.hero.desc')}<")
    
    # Meta
    content = content.replace(">6 verticals<", ">{t('solutions.meta.vert_b')}<")
    content = content.replace(">Complete AV coverage<", ">{t('solutions.meta.vert_s')}<")
    content = content.replace(">25 brands<", ">{t('solutions.meta.brands_b')}<")
    content = content.replace(">Curated portfolio<", ">{t('solutions.meta.brands_s')}<")
    content = content.replace(">1,000+ installs<", ">{t('solutions.meta.installs_b')}<")
    content = content.replace(">Supplied &amp; supported<", ">{t('solutions.meta.installs_s')}<")
    
    # CTA
    content = content.replace(">Contact us<", ">{t('solutions.cta.label')}<")
    content = content.replace(">Got a project?<", ">{t('solutions.cta.line1')}<")
    content = content.replace(">Let's build it.<", ">{t('solutions.cta.line2')}<")

    # Arrays
    old_solutions = """  const solutions = [
    {
      id: '01',
      slug: 'digital-signage',
      cat: 'Retail · Transport · Public space',
      name: 'Digital Signage',
      desc: 'LED walls, professional display panels and wayfinding that turn retail floors, terminals and public spaces into media surfaces — with the software to run them.',
      tags: ['Indoor & outdoor LED', 'Display panels', 'Wayfinding', 'CMS & scheduling'],
      img: '/assets/img/pexels-3402937-w1400.jpg',
      alt: 'Tokyo street at night covered in glowing digital signs and screen facades'
    },
    {
      id: '02',
      slug: 'control-rooms',
      cat: 'Command · Surveillance · NOC',
      name: 'Control Rooms',
      desc: '24/7-rated video walls, processors and operator workflows for command centres, surveillance suites and network operations — engineered for zero downtime.',
      tags: ['Video wall processors', '24/7 displays', 'KVM', 'Source management'],
      img: '/assets/img/pexels-11783119-w1400.jpg',
      alt: 'An operator facing a dark wall of monitors with red timecode displays'
    },
    {
      id: '03',
      slug: 'conferencing',
      cat: 'Workplace · Education · Hybrid',
      name: 'Conferencing & Collaboration',
      desc: 'Hybrid meeting rooms that sound as good as they look — interactive displays, cameras, ceiling audio and the AV-over-IP backbone connecting them.',
      tags: ['Interactive displays', 'PTZ cameras', 'Ceiling audio', 'Room booking'],
      img: '/assets/img/pexels-13323673-w1400.jpg',
      alt: 'A dark-toned conference room with a wall-mounted display and leather chairs'
    },
    {
      id: '04',
      slug: 'hospitality',
      cat: 'Hotels · Restaurants · Venues',
      name: 'Hospitality AV',
      desc: 'Guest-room entertainment, ballroom systems and background audio for hotels, restaurants and venues — technology that stays invisible until it matters.',
      tags: ['Guest-room IPTV', 'Ballroom AV', 'Background audio', 'Hospitality tablets'],
      img: '/assets/img/pexels-29870245-w1400.jpg',
      alt: 'A dark stone-walled luxury hotel lounge with glowing cube lamps'
    },
    {
      id: '05',
      slug: 'broadcast',
      cat: 'Studios · Streaming · Creators',
      name: 'Broadcast & Production',
      desc: 'Cameras, switching, live graphics and streaming infrastructure for broadcasters, studios and creators — from single-operator setups to full facilities.',
      tags: ['Studio cameras', 'Vision mixing', 'Live graphics', 'Streaming'],
      img: '/assets/img/pexels-7865064-w1400.jpg',
      alt: 'Two professional pedestal cameras in a dark television studio facing a lit set'
    },
    {
      id: '06',
      slug: 'live-events',
      cat: 'Concerts · Exhibitions · XR',
      name: 'Live Events & Immersive',
      desc: 'Touring-grade LED, projection mapping and spatial audio for concerts, exhibitions and experiential spaces — built to survive the road.',
      tags: ['Touring LED', 'Projection mapping', 'Spatial audio', 'Show control'],
      img: '/assets/img/pexels-13230484-w1400.jpg',
      alt: 'A night concert stage with red LED fixtures and blue beam lights over the crowd'
    }
  ];"""
    
    new_solutions = """  const solutions = [
    {
      id: '01',
      slug: 'digital-signage',
      cat: t('solutions.arr.0.cat'),
      name: t('solutions.arr.0.name'),
      desc: t('solutions.arr.0.desc'),
      tags: [t('solutions.arr.0.tag1'), t('solutions.arr.0.tag2'), t('solutions.arr.0.tag3'), t('solutions.arr.0.tag4')],
      img: '/assets/img/pexels-3402937-w1400.jpg',
      alt: 'Tokyo street at night covered in glowing digital signs and screen facades'
    },
    {
      id: '02',
      slug: 'control-rooms',
      cat: t('solutions.arr.1.cat'),
      name: t('solutions.arr.1.name'),
      desc: t('solutions.arr.1.desc'),
      tags: [t('solutions.arr.1.tag1'), t('solutions.arr.1.tag2'), t('solutions.arr.1.tag3'), t('solutions.arr.1.tag4')],
      img: '/assets/img/pexels-11783119-w1400.jpg',
      alt: 'An operator facing a dark wall of monitors with red timecode displays'
    },
    {
      id: '03',
      slug: 'conferencing',
      cat: t('solutions.arr.2.cat'),
      name: t('solutions.arr.2.name'),
      desc: t('solutions.arr.2.desc'),
      tags: [t('solutions.arr.2.tag1'), t('solutions.arr.2.tag2'), t('solutions.arr.2.tag3'), t('solutions.arr.2.tag4')],
      img: '/assets/img/pexels-13323673-w1400.jpg',
      alt: 'A dark-toned conference room with a wall-mounted display and leather chairs'
    },
    {
      id: '04',
      slug: 'hospitality',
      cat: t('solutions.arr.3.cat'),
      name: t('solutions.arr.3.name'),
      desc: t('solutions.arr.3.desc'),
      tags: [t('solutions.arr.3.tag1'), t('solutions.arr.3.tag2'), t('solutions.arr.3.tag3'), t('solutions.arr.3.tag4')],
      img: '/assets/img/pexels-29870245-w1400.jpg',
      alt: 'A dark stone-walled luxury hotel lounge with glowing cube lamps'
    },
    {
      id: '05',
      slug: 'broadcast',
      cat: t('solutions.arr.4.cat'),
      name: t('solutions.arr.4.name'),
      desc: t('solutions.arr.4.desc'),
      tags: [t('solutions.arr.4.tag1'), t('solutions.arr.4.tag2'), t('solutions.arr.4.tag3'), t('solutions.arr.4.tag4')],
      img: '/assets/img/pexels-7865064-w1400.jpg',
      alt: 'Two professional pedestal cameras in a dark television studio facing a lit set'
    },
    {
      id: '06',
      slug: 'live-events',
      cat: t('solutions.arr.5.cat'),
      name: t('solutions.arr.5.name'),
      desc: t('solutions.arr.5.desc'),
      tags: [t('solutions.arr.5.tag1'), t('solutions.arr.5.tag2'), t('solutions.arr.5.tag3'), t('solutions.arr.5.tag4')],
      img: '/assets/img/pexels-13230484-w1400.jpg',
      alt: 'A night concert stage with red LED fixtures and blue beam lights over the crowd'
    }
  ];"""
    content = content.replace(old_solutions, new_solutions)
    
    # "Explore Conferencing", etc
    content = content.replace(">Explore {", ">{t('solutions.explore')} {")

    with open('client/src/pages/user/Solutions.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Patched Solutions.jsx")

if __name__ == "__main__":
    patch_solutions()
