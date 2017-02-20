from django.utils.dateparse import parse_datetime

def merge_data(request):
    data = dict(request.data["doc"])
    data['abholer'] = request.data['abholer']
    dt = parse_datetime(data['docdate'])
    data['docdate'] = "%02d.%02d.%04d" % (dt.day, dt.month, dt.year)
    return data