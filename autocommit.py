import os, sys, datetime, time
from subprocess import check_call, CalledProcessError

if __name__ == "__main__":
    while True:
        dateString = str(datetime.datetime.now())
        check_call(["git", "add", "."])
        try:
            check_call(["git", "commit", "-m", "Commit on %s" % (dateString, )])
            check_call(["git", "push"])
        except (CalledProcessError, e):
            pass

        print "Sleeping for 5 minutes"
        time.sleep(300)