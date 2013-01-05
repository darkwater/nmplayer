import os          , sys    ,\
       subprocess  , select ,\
       time        , math   ,\
       pygame      , json   ,\
       mimetypes   , mpd
from os.path import *
from pygame.locals import *
from pygame.gfxdraw import *
from pygame.key import *
from BaseHTTPServer import BaseHTTPRequestHandler,HTTPServer


video = False

if video:
    pygame.init()
    screen_width = 1280
    screen_height = 720
    screen = pygame.display.set_mode((screen_width, screen_height))
    pygame.mouse.set_visible(0)

    clock = pygame.time.Clock()



def scaleclamp(n, x1, y1, x2, y2):
    n  = float(n)
    x1 = float(x1)
    y1 = float(y1)
    x2 = float(x2)
    y2 = float(y2)
    n  = sorted((x1, n, y1))[1]
    n -= x1
    n /= (y1 - x1)
    n *= (y2 - x2)
    n += x2
    return int(n)



#class Artist():
#    def __init__(self, name):
#        self.name = name
#
#class Album():
#    def __init__(self, name, artistid):
#        self.name = name
#        self.artistid = artistid
#
#class Track():
#    def __init__(self, name, albumid, filepath):
#        self.name = name
#        self.albumid = albumid
#        self.filepath = filepath
#
#
#print("Scanning for tracks...")
#artists = []
#albums  = []
#tracks  = []
#for artist in os.listdir("tracks/"):
#    artistid = len(artists)
#    artists.append(Artist(artist))
#    #print(("Artist id % 3d:  " %artistid) + artist)
#    for album in os.listdir("tracks/%s/" % artist):
#        albumid = len(albums)
#        albums.append(Album(album, artistid))
#        #print(("Album id  % 3d:    "%albumid) +album)
#        for track in os.listdir("tracks/%s/%s/" % (artist, album)):
#            trackid = len(tracks)
#            tracks.append(Track(track, albumid, "tracks/%s/%s/%s" % (artist, album, track)))
#            #print(("Track id  % 3d:      "%trackid) +track)



class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        filepath = os.getcwd() + "/www" + self.path

        if self.path[:4] == "/do/":
            action = filter(None, self.path.split("/"))
            self.send_response(200)
            self.send_header("Content-type", "text/plain")
            self.end_headers()
            #self.wfile.write("Action: %s\n" % action[1])
            if action[1] == 'getartists':
                r = {}
                for k,v in enumerate(artists):
                    r[k] = v.name
                self.wfile.write(json.dumps(r))
            elif action[1] == 'getalbums':
                r = {}
                for k,v in enumerate(albums):
                    if v.artistid == int(action[2]):
                        r[k] = v.name
                self.wfile.write(json.dumps(r))
            elif action[1] == 'gettracks':
                r = {}
                for k,v in enumerate(tracks):
                    if v.albumid == int(action[2]):
                        r[k] = v.name
                self.wfile.write(json.dumps(r))
            elif action[1] == 'update':
                r = client.status()
                r['songdata'] = client.currentsong()
                r['nextsongdata'] = client.playlistid(r['nextsongid'])[0]
                r['volume'] = scaleclamp(r['volume'], 60, 100, 0, 20)
                self.wfile.write(json.dumps(r))
            elif action[1] == 'prev':
                client.previous()
            elif action[1] == 'play' or action[1] == 'pause':
                client.pause()
            elif action[1] == 'next':
                client.next()
            elif action[1] == 'setvolume':
                action[2] = scaleclamp(r['volume'], 0, 20, 60, 100)
                if action[2] == 60:
                    action[2] = 0
                client.setvol(action[2])
            elif action[1] == 'volumeup':
                r = client.status()
                vol = scaleclamp(r['volume'], 60, 100, 0, 20)
                vol += 1
                vol = scaleclamp(vol, 0, 20, 60, 100)
                client.setvol(vol)
            elif action[1] == 'volumedown':
                r = client.status()
                vol = scaleclamp(r['volume'], 60, 100, 0, 20)
                vol -= 1
                vol = scaleclamp(vol, 0, 20, 60, 100)
                if vol == 60:
                    vol = 0
                client.setvol(vol)
            elif action[1] == 'getplaylist':
                self.wfile.write(json.dumps(client.playlistinfo()))
            elif action[1] == 'getalltracks':
                self.wfile.write(json.dumps(client.listallinfo()))
            elif action[1] == 'changetrack':
                client.playid(action[2])
            elif action[1] == 'seekpercent':
                song = client.currentsong()
                client.seek(song['pos'], int(float(action[2]) / 100 * float(song['time'])))
            return


        if os.path.isdir(filepath):
            filepath += "/index.html"

        if not os.path.exists(filepath):
            self.send_response(404)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            self.wfile.write("404 File Not Found: %s" % filepath)
        else:
            fh = open(filepath, "r")
            self.send_response(200)
            self.send_header("Content-type", mimetypes.guess_type(filepath)[0])
            self.end_headers()
            self.wfile.write(fh.read())

server = HTTPServer(('', 8080), Handler)
server.timeout = 0 # Make handle_request() not blocking
print 'Started httpserver on port 8080'


client = mpd.MPDClient()           # create client object
client.timeout = 10                # network timeout in seconds (floats allowed), default: None
client.idletimeout = None          # timeout for fetching the result of the idle command is handled seperately, default: None
client.connect("localhost", 6600)  # connect to localhost:6600


cursong = "-"
cursongrefreshtimer = 1



running = True
while running:
    try:
        server.handle_request()
    except KeyboardInterrupt:
        print(" quitting...")
        running = False
    
    if video:
        try:
            cursongrefreshtimer -= 1
            if cursongrefreshtimer <= 0:
                cursongdata = client.currentsong()
                if 'artist' in cursongdata and 'title' in cursongdata:
                    cursong = unicode(cursongdata['artist']) + u" - " + unicode(cursongdata['title'])
                elif 'title' in cursongdata:
                    cursong = unicode(cursongdata['title'])
                else:
                    cursong = unicode(cursongdata['file'])
                cursongrefreshtimer = 50
        except UnicodeDecodeError:
            cursong = "Effin' Japanese Name"


        #keys = pygame.key.get_pressed()
        #
        #if keys[K_LEFT]:
        #    a = "2"
        #
        #if keys[K_RIGHT]:
        #    a = "2"
        #
        #
        #
        background = pygame.Surface(screen.get_size())
        background = background.convert()
        background.fill((100, 0, 0))
        
        pygame.gfxdraw.box(background, (10, 10, 1260, 700), (0, 0, 0))                                                                                                                                                                              
        
        
        if pygame.font:
            font = pygame.font.Font(None, 72)
            text = font.render("Now playing:", 1, (200, 200, 200))
            font2 = pygame.font.Font(None, 108)
            text2 = font2.render(cursong, 1, (220, 220, 220))
            background.blit(text, (20, 20))
            background.blit(text2, (20, 100))
        
    
        screen.blit(background, (0, 0))
        pygame.display.flip()
    
        for event in pygame.event.get():
            if event.type == QUIT:
                running = False
            elif event.type == KEYDOWN and event.key == K_ESCAPE:
                running = False

client.close()
client.disconnect()
