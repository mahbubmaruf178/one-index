import requests
token = '0.AUoAJGMhXWgu7E-pXfpN7WNVxi5Ki92tW1ZCsPnDYLUf3meJAJY.AgABAAEAAAAtyolDObpQQ5VtlI4uGjEPAgDs_wUA9P9rUh37aKk1NkUeDx8aUP6q9q01knM70XGMg4ya-kmNQwLrBhWG3sHLItwJDDGBNmOLRB7sUgJAp6GiTiQmXcy0l6CULwkMD4Tm8GyghD6EhZhWiqwb2ylvMP9AhdQwLPjUi05Chrpr6m9J8qqyQnZprs-hzl8HoG7fLPPXcqAkmdINE7X7n-M5wiQeYG5OgM3FvGRoLV3LZ2jh9V5MRrgANJcJEM31nNhQYirfG4DQ4kGfPfgke5Ix-fsqijTpctGamt1TnHyy74qPAyru3HFXZdvGqy1qGWBdFosSRhO578YLBViMtByCFQwWmXV2zGDBXDif1SQLMRa4rP_LGJ_DVdaUTQpvuU3vlgZ-Ho7ne8ifKRgbsdxOxfztfnA--dvV4eHGUPAQiTa2HkszHuX8niU3x54l04dZGzkMXonXMQ9aeS2KMOPaO-iae31e0mqoahKD-Kffd0xDTQ1_Y6Nt17Bc5K3oshhepcf9tE-Bn_HfTdOTo-CBzdKfRxAMKQf_YEnujB09-JUIN7j8-7ht3JZgs4tgjfohGebyuTTR6kdcs2heijsT93AvhMnZ_XQ2JDGxiflMnXJ3D_FANTRHGAMIeiZM896RaHGiABebmXbU1J81D8wye3RPcJJFY3lpjCY0vox2EM4CRpklJliDUqMMiJ7GHB859_WEKr94GTSkJQRgavvRUS-bGTBhPVezvW62UDWCpqXnr8HCECdQZGCJS1qV2e5ucBV0_zaGTFPabn6caurejHNwryv8AUnGrZSrPRAUcgGrIcRvXlhY'
client_id = "0a2991a3-1674-4334-8561-671cc7349960"
client_secret = "uw67Q~TCMqdJyH35hlcHHclv~mhNOGx.jfPFm"
redirect_uri = "https://alist.nn.ci/tool/onedrive/callback"
refresh_token = "M.C106_BAY.-CZgOAqRgWQF0ClGIlGzcJ4SKjRQfUJM3tB0oOOYFrV4Ny7fhMGr1eEvSXX69ioiVnTtqRhs099j8TKyDX5xgGxcnYrrJzZMwrh5V0fvLTJBSPKUwPyee3Quz3asv4U87di!0df5rB0!VvcxuLTTvzvZ43JKJS*1*qjdMd92mqp4dObj0Tx4171ZQHKKWrCmFg!G6YvDFAhIq!VB0SHDiHRax*mqTBZTTNGb!aKVdFLsj4Geppfu758oitaESamOvNfOHMAKv9HCRYUOMvYk63tNUW4cAEc0JroUmI3FMuegJtdJ7Fb0SlGG1GfXI67ySFoBfGjDxdij6Nrv23GTBQ7H3zbbRjRyUfCNN1!ZggnWr4TDPerJWMsdxJ4YtGmX2isW49uYV63tQA!0MbUlsqd8b9YWJMgJ6ax1GhSywD!Q3ZfcL1v0JpzpS1FFmGGiiQprYTPqIsteIf0UT21oWbole3NHDaIT25HXc0C4t6pBY"
token_url = "https://login.microsoftonline.com/common/oauth2/v2.0/token"

token_data = {
    "client_id": client_id,
    "scope": "https://graph.microsoft.com/.default",
    "redirect_uri": redirect_uri,
    "grant_type": "refresh_token",
    "refresh_token": refresh_token,
    "client_secret": client_secret,
}
response = requests.post(token_url, data=token_data)
print(response.text)
#  get one drive file list
# https://graph.microsoft.com/v1.0/me/drive/root/children
accessToken = response.json()['access_token']
req = requests.get('https://graph.microsoft.com/v1.0/me/drive/root/children',
                   headers={'Authorization': 'Bearer ' + accessToken})
print(req.text)
