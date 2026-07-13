import json

def inject_json():
    with open('client/src/locales/en/common.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # ewaste
    data['ewaste'] = {
        'hero': {
            'title': 'E-Waste Management',
            'subtitle': 'Responsible recycling for a sustainable future.'
        },
        'recyclers': {
            'title': 'Our Authorised Recyclers',
            'desc': 'We have partnered with leading E-Waste management companies to ensure safe and compliant disposal of electronic waste across India.'
        },
        'centres': {
            'title': 'Collection Centres',
            'desc': 'Find a collection centre near you.'
        },
        'filter': {
            'all': 'All Centres'
        },
        'contact_person': 'Contact Person',
        'tel': 'Tel'
    }

    # contact
    data['contact'] = {
        'label': 'Contact us',
        'hero': {
            'line1': 'Have a project?',
            'line2': 'Get in touch.'
        },
        'form': {
            'name': 'Name',
            'name_ph': 'Your name',
            'phone': 'Phone',
            'email': 'Email address',
            'subject': 'Subject',
            'message': 'Message',
            'message_ph': 'How can we help you? Feel free to get in touch!',
            'submit': 'Send message',
            'submitting': 'Sending...',
            'success': 'Thanks for reaching out! We\'ll get back to you shortly.',
            'opt': {
                'general': 'General enquiries',
                'partner': 'Become a partner',
                'reseller': 'Become a reseller',
                'experience': 'Visit the Experience Centre',
                'digital': 'Digital Signage',
                'control': 'Control Rooms',
                'conferencing': 'Conferencing & Collaboration',
                'hospitality': 'Hospitality AV',
                'broadcast': 'Broadcast & Production',
                'live': 'Live Events & Immersive'
            }
        },
        'offices': {
            'title': 'Offices',
            'desc': 'Our network spans key markets in the Middle East, Africa, and Asia, ensuring we’re always within reach to support your projects.'
        },
        'general': {
            'title': 'General',
            'desc': 'Drop us a line and we’ll route it to the right person.'
        }
    }

    # experience
    data['experience'] = {
        'hero': {
            'label': 'Experience Centre — Bengaluru',
            'line1': 'Don\'t imagine it.',
            'line2': 'Walk into it.',
            'desc': 'A hands-on floor where technology meets functionality — live control rooms, collaboration suites, signage and broadcast, running side by side so you can judge them the way your clients will.',
            'book': 'Book a visit',
            'film': 'Watch the film'
        },
        'meta': {
            'zones_b': '6 live zones',
            'zones_s': 'Running demos daily',
            'brands_b': '25 brands',
            'brands_s': 'On the floor',
            'loc_b': 'OMBR Layout',
            'loc_s': 'Bangalore, India',
            'appt_b': 'By appointment',
            'appt_s': 'Guided walkthroughs'
        },
        'ov': {
            'label': 'Overview',
            'lede': 'Spec sheets tell you what a system should do. The Experience Centre shows you what it <em>actually does</em> — live, integrated, and under real conditions.',
            'p1': 'Our Bengaluru Experience Centre is a dynamic, hands-on environment designed to showcase the power of integrated AV. The floor runs live demonstrations of control room systems, collaborative meeting technologies, digital signage and more — real products from 25 global brands, wired together the way they\'d be deployed on site.',
            'p2': 'Visitors explore real-world applications, test system interoperability across brands, and work directly with our technical experts. Whether you\'re a consultant writing a spec, an integrator validating a design, or an enterprise client choosing a standard — this is the shortest path from shortlist to certainty.'
        },
        'zones': {
            'label': 'On the floor',
            'title_em': 'live',
            'desc': 'Explore the solutions we deploy across these verticals.'
        },
        'zones_arr': [
            {'name': 'Control Room Wall', 'desc': 'A 24/7-rated video wall driven by live processors — switch sources, split layouts and stress-test the workflow your operators will actually use.'},
            {'name': 'Collaboration Suite', 'desc': 'A fully wired hybrid meeting room — interactive display, PTZ cameras, ceiling audio and room booking, joined to a real call so you can hear the difference.'},
            {'name': 'Signage Gallery', 'desc': 'Indoor LED, professional panels and wayfinding running scheduled content from a live CMS — compare brightness, pitch and processing side by side.'},
            {'name': 'Broadcast Corner', 'desc': 'Cameras, vision mixing and live graphics in a compact production setup — see a multi-camera stream go from lens to output in one take.'},
            {'name': 'Audio & Hospitality Lounge', 'desc': 'Invisible and architectural speakers, guest-room IPTV and background audio staged as a lounge — technology that disappears until you press play.'},
            {'name': 'AV-over-IP Backbone', 'desc': 'The rack room that ties the floor together — AV-over-IP switching, extension and control, so you can trace every signal path end to end.'}
        ],
        'film': {
            'title': 'See it in action.',
            'desc': 'Take a quick tour of the floor.',
            'play': 'Play film'
        },
        'cta': {
            'label': 'Visit us',
            'line1': 'Walk the floor.',
            'line2': 'Test the tech.'
        }
    }

    # solutions
    data['solutions'] = {
        'hero': {
            'label': 'Solutions',
            'line1': 'Every vertical.',
            'line2': 'One partner.',
            'desc': 'From a single meeting room to a national command centre — six AV verticals, one price list, and product specialists behind every category we distribute.'
        },
        'meta': {
            'vert_b': '6 verticals',
            'vert_s': 'Complete AV coverage',
            'brands_b': '25 brands',
            'brands_s': 'Curated portfolio',
            'installs_b': '1,000+ installs',
            'installs_s': 'Supplied & supported'
        },
        'arr': [
            {
                'cat': 'Retail · Transport · Public space',
                'name': 'Digital Signage',
                'desc': 'LED walls, professional display panels and wayfinding that turn retail floors, terminals and public spaces into media surfaces — with the software to run them.',
                'tag1': 'Indoor & outdoor LED', 'tag2': 'Display panels', 'tag3': 'Wayfinding', 'tag4': 'CMS & scheduling'
            },
            {
                'cat': 'Command · Surveillance · NOC',
                'name': 'Control Rooms',
                'desc': '24/7-rated video walls, processors and operator workflows for command centres, surveillance suites and network operations — engineered for zero downtime.',
                'tag1': 'Video wall processors', 'tag2': '24/7 displays', 'tag3': 'KVM', 'tag4': 'Source management'
            },
            {
                'cat': 'Workplace · Education · Hybrid',
                'name': 'Conferencing & Collaboration',
                'desc': 'Hybrid meeting rooms that sound as good as they look — interactive displays, cameras, ceiling audio and the AV-over-IP backbone connecting them.',
                'tag1': 'Interactive displays', 'tag2': 'PTZ cameras', 'tag3': 'Ceiling audio', 'tag4': 'Room booking'
            },
            {
                'cat': 'Hotels · Restaurants · Venues',
                'name': 'Hospitality AV',
                'desc': 'Guest-room entertainment, ballroom systems and background audio for hotels, restaurants and venues — technology that stays invisible until it matters.',
                'tag1': 'Guest-room IPTV', 'tag2': 'Ballroom AV', 'tag3': 'Background audio', 'tag4': 'Hospitality tablets'
            },
            {
                'cat': 'Studios · Streaming · Creators',
                'name': 'Broadcast & Production',
                'desc': 'Cameras, switching, live graphics and streaming infrastructure for broadcasters, studios and creators — from single-operator setups to full facilities.',
                'tag1': 'Studio cameras', 'tag2': 'Vision mixing', 'tag3': 'Live graphics', 'tag4': 'Streaming'
            },
            {
                'cat': 'Concerts · Exhibitions · XR',
                'name': 'Live Events & Immersive',
                'desc': 'Touring-grade LED, projection mapping and spatial audio for concerts, exhibitions and experiential spaces — built to survive the road.',
                'tag1': 'Touring LED', 'tag2': 'Projection mapping', 'tag3': 'Spatial audio', 'tag4': 'Show control'
            }
        ],
        'explore': 'Explore',
        'next': 'Next solution'
    }

    with open('client/src/locales/en/common.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    inject_json()
