import re

def patch_solution_details():
    with open('client/src/pages/user/SolutionDetails.jsx', 'r', encoding='utf-8') as f:
        content = f.read()

    if 'useTranslation' not in content:
        content = content.replace("import Button from '../../components/common/Button/Button.jsx';", "import Button from '../../components/common/Button/Button.jsx';\nimport { useTranslation } from 'react-i18next';")
    
    if 'const { t } = useTranslation();' not in content:
        content = content.replace('const { slug } = useParams();', 'const { slug } = useParams();\n  const { t } = useTranslation();')

    # Replace dynamic fields with translations inside the JSX
    # E.g. {data.name} -> {t(`solutions.arr.${solIndex}.name`)}
    # Since I don't know solIndex in the JSX, I can just dynamically map slug to index in JSX
    
    mapping_str = """
  const solIndexMap = {
    'digital-signage': 0,
    'control-rooms': 1,
    'conferencing': 2,
    'hospitality': 3,
    'broadcast': 4,
    'live-events': 5
  };
  const solIndex = solIndexMap[slug];
"""
    if 'const solIndexMap' not in content:
        content = content.replace('const data = SOLUTIONS[slug];', mapping_str + '\n  const data = SOLUTIONS[slug];')
        
    content = content.replace('>{data.fact}<', '>{t(`solutions.arr.${solIndex}.cat`)}<')
    content = content.replace('{data.intro}', '{t(`solutions.arr.${solIndex}.desc`)}')
    content = content.replace('>{data.capsSide}<', '>{t(`solutions.arr.${solIndex}.desc`)}<') # Fallback as we don't have capsSide
    
    content = content.replace(">Next solution<", ">{t('solutions.next')}<")

    with open('client/src/pages/user/SolutionDetails.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Patched SolutionDetails.jsx")

if __name__ == "__main__":
    patch_solution_details()
