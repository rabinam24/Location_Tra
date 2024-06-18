from datetime import datetime

def read_log_file(log_file_path):
    data_entries = []
    with open(log_file_path, 'r') as log_file:
        for line in log_file:
            if "Form data received" in line:
                # Extract the full timestamp
                timestamp_str = ' '.join(line.split(' ')[0:2])
                timestamp = datetime.strptime(timestamp_str, '%Y-%m-%d %H:%M:%S,%f')
                
                form_data_str = line.split('Form data received: ')[1]
                form_data = eval(form_data_str)
                
                data_entries.append((timestamp, form_data))
    return data_entries

a = read_log_file('logs/form_data.log')
print(a)
