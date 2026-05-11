import os
import re

directories = ['app', 'components']

replacements = {
    'bg-[#0f0f1a]': 'bg-slate-50 dark:bg-[#0f0f1a]',
    'bg-[#0E1015]': 'bg-slate-100 dark:bg-[#0E1015]',
    'bg-[#12141c]': 'bg-white dark:bg-[#12141c]',
    'bg-[#1e2132]': 'bg-white dark:bg-[#1e2132]',
    'bg-[#171923]': 'bg-white dark:bg-[#171923]',
    'text-white': 'text-slate-900 dark:text-white',
    'hover:text-white': 'hover:text-slate-900 dark:hover:text-white',
    'text-gray-400': 'text-slate-500 dark:text-gray-400',
    'hover:text-gray-400': 'hover:text-slate-600 dark:hover:text-gray-400',
    'text-gray-500': 'text-slate-600 dark:text-gray-500',
    'text-gray-600': 'text-slate-400 dark:text-gray-600',
    'border-white/[0.06]': 'border-slate-200 dark:border-white/[0.06]',
    'border-white/[0.08]': 'border-slate-200 dark:border-white/[0.08]',
    'border-white/[0.1]': 'border-slate-200 dark:border-white/[0.1]',
    'bg-white/[0.04]': 'bg-slate-100 dark:bg-white/[0.04]',
    'bg-white/[0.05]': 'bg-slate-200 dark:bg-white/[0.05]',
    'bg-white/[0.08]': 'bg-slate-200 dark:bg-white/[0.08]',
    'bg-white/10': 'bg-slate-200 dark:bg-white/10',
    'hover:bg-white/10': 'hover:bg-slate-200 dark:hover:bg-white/10',
    'bg-black/20': 'bg-white dark:bg-black/20',
    'shadow-lg': 'shadow-sm dark:shadow-lg',
}

for d in directories:
    for root, _, files in os.walk(d):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                path = os.path.join(root, file)
                with open(path, 'r') as f:
                    content = f.read()
                
                original_content = content
                for old, new in sorted(replacements.items(), key=lambda x: len(x[0]), reverse=True):
                    escaped_old = re.escape(old)
                    pattern = r'(?<!dark:)(?<![-a-zA-Z0-9])' + escaped_old + r'(?![-a-zA-Z0-9])'
                    content = re.sub(pattern, new, content)
                
                if content != original_content:
                    with open(path, 'w') as f:
                        f.write(content)
                    print(f"Updated {path}")
