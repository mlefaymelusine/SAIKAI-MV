B=${BLENDER:-blender}
cd "$(dirname "$0")"
mkdir -p ../public/seq/_safe_new
$B -b --python safe.py -- ../public/seq/_safe_new/ 240 > ../logs/safe2.log 2>&1 && [ "$(ls ../public/seq/_safe_new | wc -l)" = 240 ] && rm -rf ../public/seq/safe && mv ../public/seq/_safe_new ../public/seq/safe
