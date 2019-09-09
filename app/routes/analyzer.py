import threading

class MyThread(threading.Thread):
    def __init__(self,func,args=()):
        super(MyThread,self).__init__()
        self.func = func
        self.args = args
    def run(self):
        # with thread_max_num:
        thread_max_num.acquire()
        self.result = self.func(*self.args)
        thread_max_num.release()
    def get_result(self):
        try:
            return self.result
        except Exception:
            return None

thread_max_num = threading.BoundedSemaphore(10)


def search(parameter,vedios):

	result = []
	def myFunction(parameter,v):
		flag = True
		#filter here	


		if flag:
			result.append(v)

		return
		
	li_r = []
	for v in vedios:
	    t_r = MyThread(myFunction, args=(parameter, v))
	    li_r.append(t_r)
	for t_r in li_r :
		t_r.start()
	for t_r in li_r :
		t_r.join()

	return result
	
