#coding=UTF-8
from django.test import SimpleTestCase
from document import merge_data

class MockObject(object):
    def __new__(cls, **attrs):
        result = object.__new__(cls)
        result.__dict__ = attrs
        return result

class TestViews(SimpleTestCase):

    def setUp(self):
        # Using the standard RequestFactory API to create a form POST request
        #self.factory = APIRequestFactory()

        request_data = {"doc": {"url": "http://localhost:8000/api/01/purchasedoc/10009001", "id": "10009001",
                            "subject": "Grevels - Neubau EFH - Steffen Holzbau", "remark": "123",
                            "responsible": "HONTHEIM-K",
                            "leader": "HEILES-K", "doctype": 3, "module": 9, "modulerefid": "1-0603",
                            "supplierid": "SOLID-SCHIEREN",
                            "status": 4, "docdate": "2017-02-13T14:02:11.827000Z", "data": [
            {"rowid": 30638, "purchasedocid": "10009001", "prodid": "19743", "name": "Dinki 40mm  Beutel à 125 Stk.",
             "unit": "Beutl", "quantity": 5, "price": 4.79, "amount": 23.95, "packing": "", "comment": ""}],
                            "deliverynotes": [], "stockid": "0"}, "type": "pdf", "abholer": "123"}
        self.request = MockObject(data=request_data)

    def test_renderdoc1(self):

        expect = {
            "abholer": "123",
            "docdate": "13.02.2017",
            "url": "http://localhost:8000/api/01/purchasedoc/10009001", "id": "10009001",
            "subject": "Grevels - Neubau EFH - Steffen Holzbau", "remark": "123",
            "responsible": "HONTHEIM-K",
            "leader": "HEILES-K", "doctype": 3, "module": 9, "modulerefid": "1-0603",
            "supplierid": "SOLID-SCHIEREN",
            "status": 4, "docdate": "13.02.2017", "data": [
                {"rowid": 30638, "purchasedocid": "10009001", "prodid": "19743",
                 "name": "Dinki 40mm  Beutel à 125 Stk.",
                 "unit": "Beutl", "quantity": 5, "price": 4.79, "amount": 23.95, "packing": "", "comment": ""}],
            "deliverynotes": [], "stockid": "0"}

        self.assertEqual(merge_data(self.request), expect)