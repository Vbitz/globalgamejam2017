from __future__ import print_function
import os, sys, datetime, time
from subprocess import check_call, CalledProcessError

if __name__ == "__main__":
    while True:
        s1 = "======================================================================================================"
        s2 = "===== NEXT COMMIT IN %s SECONDS ====================================================================="
        print(s1)
        dateString = str(datetime.datetime.now())
        check_call(["git", "add", "."])
        try:
            check_call(["git", "commit", "-m", "Commit on %s" % (dateString, )])
            check_call(["git", "push"])
        except (CalledProcessError):
            pass

        for x in range (0,300):
            b = s2 % (str(300 - x).zfill(3), )
            print (b, end="\r")
            time.sleep(1)

        print(s1)
        print("")