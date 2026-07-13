import re

def patch_contact():
    with open('client/src/pages/user/Contact.jsx', 'r', encoding='utf-8') as f:
        content = f.read()

    if 'useTranslation' not in content:
        content = content.replace("import { ScrollTrigger } from 'gsap/ScrollTrigger';", "import { ScrollTrigger } from 'gsap/ScrollTrigger';\nimport { useTranslation } from 'react-i18next';")
    
    if 'const { t } = useTranslation();' not in content:
        content = content.replace('const [searchParams] = useSearchParams();', 'const { t } = useTranslation();\n  const [searchParams] = useSearchParams();')

    # Replace texts
    content = content.replace(">Contact us<", ">{t('contact.label')}<")
    content = content.replace(">Have a project?<", ">{t('contact.hero.line1')}<")
    content = content.replace("><em>Get in touch.</em><", "><em>{t('contact.hero.line2')}</em><")
    content = content.replace(">Name<", ">{t('contact.form.name')}<")
    content = content.replace('placeholder="Your name"', 'placeholder={t("contact.form.name_ph")}')
    content = content.replace(">Phone<", ">{t('contact.form.phone')}<")
    content = content.replace(">Email address<", ">{t('contact.form.email')}<")
    content = content.replace(">Subject<", ">{t('contact.form.subject')}<")
    content = content.replace(">Message<", ">{t('contact.form.message')}<")
    content = content.replace('placeholder="How can we help you? Feel free to get in touch!"', 'placeholder={t("contact.form.message_ph")}')
    content = content.replace(">Send message<", ">{t('contact.form.submit')}<")
    content = content.replace(">Sending...<", ">{t('contact.form.submitting')}<")
    
    # Options
    opts = [
      "General enquiries", "Become a partner", "Become a reseller", 
      "Visit the Experience Centre", "Digital Signage", "Control Rooms",
      "Conferencing &amp; Collaboration", "Hospitality AV", 
      "Broadcast &amp; Production", "Live Events &amp; Immersive"
    ]
    
    # We leave value="..." intact, just translate the text node
    content = content.replace(">General enquiries<", ">{t('contact.form.opt.general')}<")
    content = content.replace(">Become a partner<", ">{t('contact.form.opt.partner')}<")
    content = content.replace(">Become a reseller<", ">{t('contact.form.opt.reseller')}<")
    content = content.replace(">Visit the Experience Centre<", ">{t('contact.form.opt.experience')}<")
    content = content.replace(">Digital Signage<", ">{t('contact.form.opt.digital')}<")
    content = content.replace(">Control Rooms<", ">{t('contact.form.opt.control')}<")
    content = content.replace(">Conferencing &amp; Collaboration<", ">{t('contact.form.opt.conferencing')}<")
    content = content.replace(">Hospitality AV<", ">{t('contact.form.opt.hospitality')}<")
    content = content.replace(">Broadcast &amp; Production<", ">{t('contact.form.opt.broadcast')}<")
    content = content.replace(">Live Events &amp; Immersive<", ">{t('contact.form.opt.live')}<")
    
    content = content.replace(">Thanks for reaching out! We'll get back to you shortly.<", ">{t('contact.form.success')}<")
    
    content = content.replace(">Offices<", ">{t('contact.offices.title')}<")
    content = content.replace(">Our network spans key markets in the Middle East, Africa, and Asia, ensuring we’re always within reach to support your projects.<", ">{t('contact.offices.desc')}<")
    
    content = content.replace(">General<", ">{t('contact.general.title')}<")
    content = content.replace(">Drop us a line and we’ll route it to the right person.<", ">{t('contact.general.desc')}<")

    with open('client/src/pages/user/Contact.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Patched Contact.jsx")

if __name__ == "__main__":
    patch_contact()
