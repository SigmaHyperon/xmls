# XMLScript Precompiler
a colleague showed me a kind of XML Programming language he had to work with, so i wrote a short little precomp, that can transform python-like pseudocode into XML

input:
```python
if
	equals arg1="test" arg2="test"
	then
		delete include="test"
			fileset dir="test"
```

output:
```xml
<if>
	<equals arg1="test" arg2="test"/>
	<then>
		<delete include="test">
			<fileset dir="test"/>
		</delete>
	</then>
</if>
```

usage:
```
Options:
  --version         Show version number                                [boolean]
  -i, --inputfile   input file                 [string] [default: "source.xmls"]
  -o, --outputfile  output file                 [string] [default: "output.xml"]
  -s, --spaces      assume indentation using spaces   [boolean] [default: false]
  -h, --help        Show help                                          [boolean]

Examples:
  xmls -i source.xmls -o output.xml
  xmls -s
  xmls
```