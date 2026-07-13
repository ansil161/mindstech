import os
import re
import json
import subprocess

def recover_translations():
    # Get the diff
    result = subprocess.run(['git', 'diff', 'client/src/pages/user/'], capture_output=True, text=True)
    diff = result.stdout
    
    # We want to match:
    # - text that was removed
    # + text with {t('some.key')}
    
    en_dict = {}
    
    # Simple state machine to parse diff
    last_removed_texts = []
    
    lines = diff.split('\n')
    for line in lines:
        if line.startswith('-') and not line.startswith('---'):
            # Extract text from tags
            matches = re.findall(r'>([^<]+)<', line)
            for m in matches:
                clean = m.strip()
                if clean and not re.match(r'^[\W_]+$', clean) and len(clean) > 2:
                    last_removed_texts.append(clean)
                    
            # Also extract text not in tags but just floating
            # this is a bit harder but let's assume standard JSX
            
        elif line.startswith('+') and not line.startswith('+++'):
            # Look for t('key')
            t_matches = re.findall(r"t\('([^']+)'\)", line)
            if t_matches:
                for key in t_matches:
                    # If we have a removed text, associate it
                    if last_removed_texts:
                        # Just take the first one or combine them?
                        # Usually it's 1:1 line replacement
                        text = last_removed_texts.pop(0)
                        
                        # Populate dictionary
                        parts = key.split('.')
                        curr = en_dict
                        for i, part in enumerate(parts):
                            if i == len(parts) - 1:
                                curr[part] = text
                            else:
                                if part not in curr:
                                    curr[part] = {}
                                curr = curr[part]
            else:
                # If it's a completely new line without t(), clear buffer maybe?
                pass
        elif not line.startswith('-') and not line.startswith('+'):
            last_removed_texts = []

    # Let's see if we got them
    print(json.dumps(en_dict, indent=2))
    
    # We should merge this with the existing common.json
    base_path = 'client/src/locales/en/common.json'
    with open(base_path, 'r', encoding='utf-8') as f:
        existing = json.load(f)
        
    def merge(a, b):
        for key, value in b.items():
            if isinstance(value, dict):
                node = a.setdefault(key, {})
                merge(node, value)
            else:
                a[key] = value
        return a
        
    merged = merge(existing, en_dict)
    
    with open(base_path, 'w', encoding='utf-8') as f:
        json.dump(merged, f, indent=2)
        
    print("Recovered JSON saved to en/common.json")

if __name__ == "__main__":
    recover_translations()
