import json

links = [("Tom","Dick"),("Dick","Harry"),("Tom","Larry"),("Bob","Leroy"),("Bob","Earl")]
parents, children = zip(*links)
root_nodes = {x for x in parents if x not in children}
for node in root_nodes:
    links.append(('Root', node))

def get_nodes(node):
    d = {}
    d['name'] = node
    children = get_children(node)
    if children:
        d['children'] = [get_nodes(child) for child in children]
    return d

def get_children(node):
    return [x[1] for x in links if x[0] == node]

tree = get_nodes('Root')
print (json.dumps(tree, indent=4))