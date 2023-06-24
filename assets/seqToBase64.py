import base64
import json

totalFrames = 6571
parts = 20
size = int(totalFrames/parts)

print("total:" + str(totalFrames))
print("parts:" + str(parts))
print("size_def:" + str(size))
checksum = 0
for part in range(parts):
    base64Data = {"seq": []}
    if (part == parts-1):
        size = totalFrames - size*(parts-1) + 1

    for i in range(checksum, checksum+size):
        i = 10000+i
        # print(f"seq/badapple_{i}.jpg");
        with open(f"seq/badapple_{i}.jpg", "rb") as image_file:
            base64Data["seq"].append(base64.b64encode(image_file.read()).decode("utf-8"))
            # base64Data["seq"].append(f"seq/badapple_{i}.jpg")
    checksum += size

    # data:image/jpeg;base64,
    with open(f"b64apple_p{part}.json", "w") as jsondata_file:
        json.dump(base64Data, jsondata_file, indent=4)

print("size_end:" + str(size))
print("checksum:" + str(checksum))