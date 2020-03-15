import ast
import os

accel = []
gyro = []
path = '/Users/ryry/School/cmsc23400/project/wavesAccelerometer/recordedAccelGyroData/raw/WAVES_TEST_ACCEL_GYRO_DATA_3-14-20-MIXED2.txt'
test_file = open(path, 'r')
tmp = test_file.read().split('Gyroscope:')
#out1 = open('test1.txt', 'w')
#out2 = open('test2.txt', 'w')
length1 = len(tmp[0])
str1 = tmp[0][15:length1-1]
length2 = len(tmp[1])
str2 = tmp[1][1:length2]

accel.extend(ast.literal_eval(str1))
gyro.extend(ast.literal_eval(str2))

gesture_number = 25
trial_number = 1

for gesture in accel:
    for trial in gesture:
        write_path_accel = '/Users/ryry/School/cmsc23400/project/wavesAccelerometer/recordedAccelGyroData/final/accel/G%d/trial%d.csv' % (gesture_number, trial_number)
        write_path_gyro = '/Users/ryry/School/cmsc23400/project/wavesAccelerometer/recordedAccelGyroData/final/gyro/G%d/trial%d.csv' % (gesture_number, trial_number)
        os.makedirs(os.path.dirname(write_path_accel), exist_ok=True)
        os.makedirs(os.path.dirname(write_path_gyro), exist_ok=True)
        out_accel = open(write_path_accel, 'w')
        out_gyro = open(write_path_gyro, 'w')
        for dictionary in trial:
            out_accel.write(str(dictionary['time']) + ', ')
            out_gyro.write(str(dictionary['time']) + ', ')
        out_accel.write('\n')
        out_gyro.write('\n')
        for dictionary in trial:
            out_accel.write(str(dictionary['x']) + ', ')
            out_gyro.write(str(dictionary['x']) + ', ')
        out_accel.write('\n')
        out_gyro.write('\n')
        for dictionary in trial:
            out_accel.write(str(dictionary['y']) + ', ')
            out_gyro.write(str(dictionary['y']) + ', ')
        out_accel.write('\n')
        out_gyro.write('\n')
        for dictionary in trial:
            out_accel.write(str(dictionary['z']) + ', ')
            out_gyro.write(str(dictionary['z']) + ', ')
        trial_number += 1
    trial_number = 1
    gesture_number += 1