import json
import numpy as np
import onnxruntime
import sys
import os
import time


def init():
    global session, input_name, output_name
    # AZUREML_MODEL_DIR is an environment variable created during deployment.
    # It is the path to the model folder (./azureml-models/$MODEL_NAME/$VERSION)
    # For multiple models, it points to the folder containing all deployed models (./azureml-models)
    #model = os.path.join(os.getenv('AZUREML_MODEL_DIR'), 'model.onnx')
    #session = onnxruntime.InferenceSession(model, None)
    #model = Model.get_model_path(model_name = 'MB1')
    model = os.path.join(os.getenv('AZUREML_MODEL_DIR'), 'model31.onnx')
    session = onnxruntime.InferenceSession(model, None)
    input_name = session.get_inputs()[0].name
    output_name = session.get_outputs()[0].name


def preprocess(input_data_json):
    # convert the JSON data into the tensor input
    accel_dict = np.array(json.loads(input_data_json)['accel'])
    gyro_dict = np.array(json.loads(input_data_json)['gyro'])

    acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z = [], [], [], [], [], []
    for time_stamp_idx in range(min(len(accel_dict), len(gyro_dict))):
        if time_stamp_idx < 30:
            curr_acc_time_stamp = accel_dict[time_stamp_idx]
            curr_gyro_time_stamp = gyro_dict[time_stamp_idx]
            acc_x.append(curr_acc_time_stamp.get('x'))
            acc_y.append(curr_acc_time_stamp.get('y'))
            acc_z.append(curr_acc_time_stamp.get('z'))
            gyro_x.append(curr_gyro_time_stamp.get('x'))
            gyro_y.append(curr_gyro_time_stamp.get('y'))
            gyro_z.append(curr_gyro_time_stamp.get('z'))

    while len(acc_x) < 30:
        acc_x.append(acc_x[-1])
        acc_y.append(acc_y[-1])
        acc_z.append(acc_z[-1])
        gyro_x.append(gyro_x[-1])
        gyro_y.append(gyro_y[-1])
        gyro_z.append(gyro_z[-1])

    trial_info = np.array([np.array(acc_x), np.array(acc_y), np.array(
        acc_z), np.array(gyro_x), np.array(gyro_y), np.array(gyro_z)]).astype('float32')
    trial_info = np.transpose(trial_info)
    trial_info = np.array([trial_info])

    return trial_info
   # return np.array(json.loads(input_data_json)['data']).astype('float32')


def postprocess(result):
    # We use argmax to pick the highest confidence label
    # return int(np.argmax(np.array(result).squeeze(), axis=0))
    # return np.array(result).tolist()
    prob_array = result[0][0]
    pred = int(np.argmax(prob_array, axis=0))
    print("pred")
    print(pred)
    if prob_array[2] > 0.97 and prob_array[3] > 0.97:
        pred = 3

    return pred


def run(input_data):

    print("input data")
    print(input_data)
    try:

        # load in our data, convert to readable format
        data = preprocess(input_data)

        # start timer
        #start = time.time()

        r = session.run([output_name], {input_name: data})

        # end timer
        #end = time.time()

        result = postprocess(r)
        result_dict = {"result": result}
    except Exception as e:
        result_dict = {"error": str(e)}

    return result_dict


def choose_class(result_prob):
    """We use argmax to determine the right label to choose from our output"""
    return int(np.argmax(result_prob, axis=0))
