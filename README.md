NMplayer
========

A Python-based MPD client with a web client, meant for running on a Raspberry Pi.


Setup
-----

Right now, NMplayer only sends commands like play and status etc. Playlist management should be done manually or with another client for now.

1. Install python and mpd if you do not already have those.
2. Install python-mpd
3. Set up mpd to the point that it should be able to start playing.
4. Get the Raspberry Pi's IP (eg. `ifconfig`)
5. Run `python nmplayer.py`
6. Go to http://192.168.1.104:8080/cpanel.html (use your RPi's IP)
7. Have fun!

###List of commands
Running these commands from a fresh Raspbian 'wheezy' installation should work.

    wget https://github.com/Darkwater124/nmplayer/archive/master.zip
    unzip master.zip
    cd nmplayer-master/
    sudo apt-get install mpd
    sudo apt-get install python-mpd
      Put music files in /var/lib/mpd/music
    python
    >>> import mpd
    >>> c = mpd.MPDClient()
    >>> c.connect("localhost", 6600)
    >>> c.update()
    >>> c.add("")
    >>> c.playlistinfo() # This should show the tracks in /var/lib/mpd/music
    >>> exit()
    python nmplayer.py
      Go to raspberry pi's ip :8080/cpanel.html in a browser
      Click on a track under the Current Playlist tab


Notes
-----

- I haven't tried doing this all from 0 yet, so the previous steps could not be enough to get it running. Please create an issue or something if it doesn't work.

- The web interface has only been tested on Google Chrome, iOS Mobile Safari and Android Dolphin Browser.

- If you set `video` to True at the top of mplayer.py and the Raspberry Pi is attached to a screen, it will show the name of the currently playing song on a _very_ simple UI. This will be improved later.

- You should use cpanel.html and not index.html. index.html is an outdated page meant to be solely for display, while cpanel.html has the controls. I'm not sure what to do with this.

- Right now, the All Tracks tab only contains a list of all tracks in MPD's tracks directory. It does not do anything else yet.

- I've only tested this with all music files in a single directory, I don't know how subdirectories are handled.

- The web interface is pretty slow right now, that's because every update and action is a seperate HTTP request. I am currently figuring out how to use sockets to make things go faster.

- Tip: If you keep getting 'problems decoding', make sure that MPD has _ALL_ required permissions to the music files, including public read permissions on the files, the containing directory, _and all parent directories_. This got me annoyed for hours.
