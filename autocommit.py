import os, sys, datetime
from subprocess import check_call

if __name__ == "__main__":
    dateString = str(datetime.datetime.now())
    check_call(["git", "add", "."])
    check_call(["git", "commit", "-m", "Commit on %s" % (dateString, )])