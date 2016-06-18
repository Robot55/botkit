// this code is run twice 
// see implementation notes below 
console.log(process.pid);
 
// after this point, we are a daemon 
require('daemon')();
 
// different pid because we are now forked 
// original parent has exited 
console.log(process.pid);


/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample Slack bot built with Botkit.

This bot demonstrates many of the core features of Botkit:

* Connect to Slack using the real time API
* Receive messages based on "spoken" patterns
* Reply to messages
* Use the conversation system to ask questions
* Use the built in storage system to store and retrieve information
  for a user.

# RUN THE BOT:

  Get a Bot token from Slack:

    -> http://my.slack.com/services/new/bot

  
# USE THE BOT:

  Find your bot inside Slack to send it a direct message.

  Say: "Hello"

  The bot will reply "Hello!"

  Say: "who are you?"

  The bot will tell you its name, where it running, and for how long.

  Say: "Call me <nickname>"

  Tell the bot your nickname. Now you are friends.

  Say: "who am I?"

  The bot will tell you your nickname, if it knows one for you.

  Say: "shutdown"

  The bot will ask if you are sure, and then shut itself down.

  Make sure to invite your bot into other channels using /invite @<my bot>!

# EXTEND THE BOT:

  Botkit has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

 following 3 lines = exit if no token 
if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}


// setup required variables
var Botkit = require('./lib/Botkit.js');
var os = require('os');
// Controller is the main botkit mechanism to handle bot mgmt
var controller = Botkit.slackbot({
    debug: true,
});
// bot - start your engine!
var bot = controller.spawn({
}).startRTM();


controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', function(bot, message) {

    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'robot_face',
    }, function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });


    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Hello ' + user.name + '!!');
        } else {
            bot.reply(message, 'Hello.');
        }
    });
});

controller.hears(['call me (.*)', 'my name is (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var name = message.match[1];
    controller.storage.users.get(message.user, function(err, user) {
        if (!user) {
            user = {
                id: message.user,
            };
        }
        user.name = name;
        controller.storage.users.save(user, function(err, id) {
            bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
        });
    });
});

// ===== IMGUR !!!! =======
controller.hears(["(.*)imgur "+"(.*)"], 'direct_message,direct_mention,mention', function(bot, message) {
    var mysearch = message.match[2];
	var request = require("request");
	var options = {
		url: 'http://imgur.com/search/relevance',
		qs: {"q":mysearch}
	}
	try{	
		request(options,function (error, response, body){
			//console.log(error,response,body);
			var scrapedImageFileName = (body.split('src="//i.imgur.com/')[1].split('" />')[0]);
			var fullURLToImage = "http://i.imgur.com/"+scrapedImageFileName;
			console.log(fullURLToImage)
			bot.reply(message,{
					text:'',
		    		attachments: [
				        {
			            "fallback": "Ha ha! your client doesn't show images!",
			            "image_url": fullURLToImage
		        		}
				    ]
				})	
		})
	}	catch 	(e){
		bot.reply(message, 'Imgur search failed :( Rephrase your search maybe....')
	}
})


controller.hears(["(.*)weather in"+"(.*)?"], 'direct_message,direct_mention,mention', function(bot, message) {
    var city = message.match[2];
	var request = require('request');
		request('http://api.openweathermap.org/data/2.5/weather?q='+city+'&appid=3c1e43849b73fb7848c8e9663ee3ee36&units=metric', function (error, response, body) {
		  if (!error && response.statusCode == 200) {
		  	var parsedbody = JSON.parse(body)
		  	var temp = parsedbody.main.temp
		  	 bot.reply(message,'the temperture in '+parsedbody.name+' is '+temp)
		//  	console.log(temp)
		//    console.log(parsedbody.main)
		  }
		})
});

controller.hears(["(.*)weather?"], 'direct_message,direct_mention,mention', function(bot, message) {
    var blurb = message.match[1];
	var request = require('request');
		request('http://api.openweathermap.org/data/2.5/weather?q=tel aviv&appid=3c1e43849b73fb7848c8e9663ee3ee36&units=metric', function (error, response, body) {
		  if (!error && response.statusCode == 200) {
		  	var parsedbody = JSON.parse(body)
		  	var temp = parsedbody.main.temp
		  	 bot.reply(message,'the temperture in '+parsedbody.name+' is '+temp)
		//  	console.log(temp)
		//    console.log(parsedbody.main)
		  }
		})
});

controller.hears(["(.*)latest technews", "(.*)latest tech news"], 'direct_message,direct_mention,mention', function(bot, message) {
    var blurb = message.match[1];
	var request = require('request');
request('https://www.reddit.com/r/technews/hot.json?limit=5', function (error, response, body) {
  if (!error && response.statusCode == 200) {
  	var parsedbody = JSON.parse(body)
  	//var temp = parsedbody.main.temp
  	//console.log(temp)
   // console.log(parsedbody.data.children)
   var newsoutput=''
   for (var i in parsedbody.data.children){
   	var item = parsedbody.data.children[i]
   	//console.log(item.data.title)
   	//console.log(item.data.url)
   	//console.log(' ')
   	newsoutput=newsoutput+item.data.title+'\n'+item.data.url+'\n\n'
   } 
   	bot.reply(message, 'here are the latest tech news: \n'+newsoutput)
  }
})
});



controller.hears(['what is my name', 'who am i'], 'direct_message,direct_mention,mention', function(bot, message) {

    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Your name is ' + user.name);
        } else {
            bot.startConversation(message, function(err, convo) {
                if (!err) {
                    convo.say('I do not know your name yet!');
                    convo.ask('What should I call you?', function(response, convo) {
                        convo.ask('You want me to call you `' + response.text + '`?', [
                            {
                                pattern: 'yes',
                                callback: function(response, convo) {
                                    // since no further messages are queued after this,
                                    // the conversation will end naturally with status == 'completed'
                                    convo.next();
                                }
                            },
                            {
                                pattern: 'no',
                                callback: function(response, convo) {
                                    // stop the conversation. this will cause it to end with status == 'stopped'
                                    convo.stop();
                                }
                            },
                            {
                                default: true,
                                callback: function(response, convo) {
                                    convo.repeat();
                                    convo.next();
                                }
                            }
                        ]);

                        convo.next();

                    }, {'key': 'nickname'}); // store the results in a field called nickname

                    convo.on('end', function(convo) {
                        if (convo.status == 'completed') {
                            bot.reply(message, 'OK! I will update my dossier...');

                            controller.storage.users.get(message.user, function(err, user) {
                                if (!user) {
                                    user = {
                                        id: message.user,
                                    };
                                }
                                user.name = convo.extractResponse('nickname');
                                controller.storage.users.save(user, function(err, id) {
                                    bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
                                });
                            });



                        } else {
                            // this happens if the conversation ended prematurely for some reason
                            bot.reply(message, 'OK, nevermind!');
                        }
                    });
                }
            });
        }
    });
});


controller.hears(['shutdown'], 'direct_message,direct_mention,mention', function(bot, message) {

    bot.startConversation(message, function(err, convo) {

        convo.ask('Are you sure you want me to shutdown?', [
            {
                pattern: bot.utterances.yes,
                callback: function(response, convo) {
                    convo.say('Bye!');
                    convo.next();
                    setTimeout(function() {
                        process.exit();
                    }, 3000);
                }
            },
        {
            pattern: bot.utterances.no,
            default: true,
            callback: function(response, convo) {
                convo.say('*Phew!*');
                convo.next();
            }
        }
        ]);
    });
});


controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
    'direct_message,direct_mention,mention', function(bot, message) {

        var hostname = os.hostname();
        var uptime = formatUptime(process.uptime());

        bot.reply(message,
            ':robot_face: I am a bot named <@' + bot.identity.name +
             '>. I have been running for ' + uptime + ' on ' + hostname + '.');

    });

function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}
