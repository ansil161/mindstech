import re

def patch_ewaste():
    with open('client/src/pages/user/EWaste.jsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add useTranslation import
    if 'useTranslation' not in content:
        content = content.replace("import Button from '../../components/common/Button/Button.jsx';", "import Button from '../../components/common/Button/Button.jsx';\nimport { useTranslation } from 'react-i18next';")
    
    # 2. Add t hook inside component
    if 'const { t } = useTranslation();' not in content:
        content = content.replace('const [filter, setFilter] = useState(\'all\');', 'const [filter, setFilter] = useState(\'all\');\n  const { t } = useTranslation();')

    # 3. We won't translate CENTRES to avoid messing up physical addresses.
    # We will translate static text in the JSX instead using regex.
    # Replace "E-Waste Management"
    content = content.replace(">E-Waste Management<", ">{t('ewaste.hero.title')}<")
    content = content.replace(">Responsible recycling for a sustainable future.<", ">{t('ewaste.hero.subtitle')}<")
    
    content = content.replace(">Our Authorised Recyclers<", ">{t('ewaste.recyclers.title')}<")
    content = content.replace(">We have partnered with leading E-Waste management companies to ensure safe and compliant disposal of electronic waste across India.<", ">{t('ewaste.recyclers.desc')}<")
    
    content = content.replace(">Collection Centres<", ">{t('ewaste.centres.title')}<")
    content = content.replace(">Find a collection centre near you.<", ">{t('ewaste.centres.desc')}<")
    
    content = content.replace(">All Centres<", ">{t('ewaste.filter.all')}<")
    
    content = content.replace(">Contact Person:<", ">{t('ewaste.contact_person')}:<")
    content = content.replace(">Tel:<", ">{t('ewaste.tel')}:<")

    with open('client/src/pages/user/EWaste.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Patched EWaste.jsx")

if __name__ == "__main__":
    patch_ewaste()
