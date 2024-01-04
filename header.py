import requests

url = 'http://192.168.0.189:4321/api/download'
params = {
    'path': 'onedriveone',
    'id': '0162GLWGDM5BVNZY63OZALRRW22VBMUHHC'
}
range_header = {'Range': 'bytes=0-499'}  # Specify the range you want here

response = requests.get(url, params=params, headers=range_header)

if response.status_code == 200:
    # Handle the response content
    with open('partial_content.txt', 'wb') as file:
        file.write(response.content)
    print("Partial content saved to 'partial_content.txt'")
else:
    print(f"Request failed with status code: {response.status_code}")
    print(response.text)  # Print error message if any
