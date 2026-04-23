import markdown
import re

template = open("template.html").read()
poem     = open("poem.md").read()

poem = re.sub(r'!\[\[(.*?)\]\]', r'![](\1)', poem)

content  = markdown.markdown(poem, extensions=['nl2br', 'extra'])
output   = template.replace("{{content}}", content)
open("poem.html", "w").write(output)

print("done!")