B=${BLENDER:-blender}
cd "$(dirname "$0")"
$B -b --python book.py -- ../public/seq/bookOpen/ 210 open > ../logs/bookOpen.log 2>&1
$B -b --python book.py -- ../public/seq/bookClose/ 90 close > ../logs/bookClose.log 2>&1
