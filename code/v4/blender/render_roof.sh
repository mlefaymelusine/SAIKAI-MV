B=${BLENDER:-blender}
cd "$(dirname "$0")"
$B -b --python roof.py -- ../public/seq/roofA/ 150 A > ../logs/roofA.log 2>&1
$B -b --python roof.py -- ../public/seq/roofB/ 120 B > ../logs/roofB.log 2>&1
$B -b --python roof.py -- ../public/seq/roofBurned/ 120 burned > ../logs/roofBurned.log 2>&1
# W2 (10-24): the city, then up into the sky; transparent PNGs + camera.json, composited by tools/starsky.py w2
mkdir -p ../work_roofT && $B -b --python roof.py -- ../work_roofT/ 246 T > ../logs/roofT.log 2>&1
