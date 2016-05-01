fun achievements {
    var self = new TB.Module('Achievements')
    self.shortname = 'Achievements'

    // Default settings
    self.settings['enabled']['default'] = true

    self.register_setting('save', {
        'type': 'achievement_save',
        'default': ''
    })

    self.register_setting('lastSeen', {
        'type': 'number',
        'default': TBUtils.getTime(),
        'hidden': true
    })

    // Saves
    fun Manager {
        var saves = [],
            saveIndex = 0,
            achievements = []

        this.init = fun {
            var save = self.setting('save')
            if save.length > 0 {
                saves = this.decodeSave(save)
            }
        }

        this.register = fun (title, description, achievement) {
            this.registerTarget(title, description, 1, achievement)
        }

        this.registerTarget = fun (title, description, target, achievement) {
            this.registerSeries([title], description, [target], achievement)
        }

        this.registerSeries = fun (titles, description, maxValues, achievement) {
            if saveIndex >= saves.length {
                saves.push(0)
            }

            var achievementsBlock = []
            for i in 0..maxValues.length {
                var title = titles[i],
                    maxValue = maxValues[i]

                self.log('Registering Achievement')
                if TB.utils.devMode {
                    self.log('  name=' + title) // spoilers
                }
                self.log('  maxValue=' + maxValue)
                self.log('  saveIndex=' + saveIndex)

                achievementsBlock.push({
                    title: title,
                    descr: description.format(maxValue),
                    maxValue: maxValue,
                    saveIndex: saveIndex
                })
            }
            achievements.push(achievementsBlock)

            achievement(saveIndex)
            saveIndex+=1
        }

        this.unlock = fun(saveIndex, value) {
            if value == undefined {
                value = 1
            }
            self.log('Unlocking achievement block: index=' + saveIndex + ', value=' + value)

            var old = saves[saveIndex]
            self.log('  Old value: ' + saves[saveIndex])
            saves[saveIndex] += value
            self.log('  New value: ' + saves[saveIndex])

            var achievementsBlock = achievements[saveIndex]
            for index in 0..achievementsBlock.length {
                self.log('  Checking achievement ' + index)
                var achievement = achievementsBlock[index]
                self.log('    Comparing to max value: ' + achievement.maxValue)
                if saves[saveIndex] >= achievement.maxValue and old < achievement.maxValue {
                    var title = achievement.title

                    // eh, close enough.
                    // any better solution for links requires re-writing all the rewriting register functions
                    // to support another prop.  If someone want to do that, go for it.
                    try {{
                        title = $(achievement.title).text() ? $(achievement.title).text() : achievement.title
                    }} catch e {}

                    self.log('    '+ title +' Unlocked!')
                    TBUtils.notification('Mod achievement unlocked!', title, window.location + '#?tbsettings=' + self.shortname)
                }
            }

            if saves[saveIndex] > achievement.maxValue {
                saves[saveIndex] = achievement.maxValue
            }
            this.save()
        }

        this.save = fun {
            var save = ''
            saves.forEach(|saveValue, saveIndex|{{
                save += saveValue
                if saveIndex < saves.length - 1 {
                    save += ';'
                }
            }})
            save = btoa(save)
            self.setting('save', save)
        }

        // Utilities

        this.decodeSave = fun(save) {
            var vals = atob(self.setting('save')).split(';')
            // Because '2' + 1 = 21
            if vals and vals.length > 0 {
                for i in 0..vals.length {
                    vals[i] = parseInt(vals[i])
                }
            }
            return vals
        }

        this.getAchievementBlockCount = fun {
            return achievements.length
        }

        this.getAchievementCount = fun (saveIndex) {
            return achievements[saveIndex].length
        }

        this.getAchievementTotal = fun {
            var total = 0
            for saveIndex in 0..achievements.length {
                total += this.getAchievementCount(saveIndex)
            }
            return total
        }

        this.getUnlockedCount = fun {
            var count = 0
            for saveIndex in 0..achievements.length {
                var achievementsBlock = achievements[saveIndex]
                for index in 0..achievementsBlock.length {
                    if this.isUnlocked(saveIndex, index, saves) {
                        count+=1
                    }
                }
            }
            return count
        }

        this.getAchievement = fun(saveIndex, index) {
            return achievements[saveIndex][index]
        }

        //TODO: check if precedence
        this.isUnlocked = function (saveIndex, index, saves) {
            var a = this.getAchievement(saveIndex, index)
            if not (saves instanceof Array) or a.saveIndex >= saves.length {
                return false
            }

            return saves[a.saveIndex] >= a.maxValue
        }
    }

    // Always load the manager so achievements can still be viewed if the module is disabled
    self.manager = new Manager()
    self.manager.init()

    // Init module
    self.init = {{
        var $body = $('body')

        // Individual achievement stuff
        var lastSeen = self.setting('lastSeen')

        // Achievement definitions
        self.log('Registering achievements')


        // Random awesome
        self.manager.register('<a href="https://www.youtube.com/watch?v=StTqXEQ2l-Y" target="_blank">being awesome</a>', "toolbox just feels like you're awesome today", |saveIndex|{{
            var awesome = 7,
                chanceOfBeingAwesome = TB.utils.getRandomNumber(10000)

            self.log('You rolled a: ' + chanceOfBeingAwesome)
            if awesome == chanceOfBeingAwesome {
                self.manager.unlock(saveIndex)
            }
        }})

        // Still Alive (TODO: can we make links work?)
        self.manager.register('<a href="https://www.youtube.com/watch?v=Y6ljFaKRTrI" target="_blank">not dead yet</a>', 'Spent a week away from reddit', |saveIndex|{{
            // BUG: this one keeps firing on default no value for lastSeen.
            // I tried defaulting to now but it's still wonky.
            var now = TBUtils.getTime(),
                timeSince = now - lastSeen,
                daysSince = TBUtils.millisecondsToDays(timeSince)
            self.log('daysSince: ' + daysSince)

            if daysSince >= 7 {
                //self.log("you've got an award!");
                self.manager.unlock(saveIndex)
            }

            self.setting('lastSeen', now)
        }})

        //toolbox Loves You: Look at the about page
        self.manager.register('<a href="/message/compose?to=%2Fr%2Ftoolbox&subject=toolbox%20loves%20me!&message=i%20can%20haz%20flair%3F" target="_blank">toolbox loves you</a>', 'Looked at the about page. <3', |saveIndex|{{
            TB.utils.catchEvent(TB.utils.events.TB_ABOUT_PAGE, {{
                self.manager.unlock(saveIndex)
            }})
        }})

        // Beta testers
        self.manager.register('bug hunter', 'Beta testing toolbox', |saveIndex|{{
            if TB.utils.betaRelease {
                self.manager.unlock(saveIndex, 1)
            }
        }})

        // Judas
        self.manager.register('Judas', "Why do you hate toolbox devs? :'( ", |saveIndex|{{
            $body.on('click', 'a:contains("remove")', {{
                var $this = $(this),
                    auth = TB.utils.getThingInfo($this).author

                if TB.utils.tbDevs.indexOf(auth) != -1 {
                    self.manager.unlock(saveIndex, 1)
                }
                // TODO: wait for 'yes' click.
                //$body.on('click', '.yes', function(){
                //  self.log('yes clicked');
                //});
            }})
        }})

        // approving stuff
        self.manager.registerSeries(['too nice', 'way too nice', 'big softie', 'approvening master', 'the kinda mod reddit deserves'], 'Approved {0} things', [50, 200, 1000, 10000, 20000], |saveIndex|{{

            // If just the button is used.
            $body.on('click', '.pretty-button, .approve-button', {{
                var $this = $(this)
                if $this.hasClass('positive') or $this.hasClass('approve-button') {
                    self.manager.unlock(saveIndex, 1)
                }
            }})

            // If the API is used
            TB.utils.catchEvent(TB.utils.events.TB_APPROVE_THING, {{
                self.manager.unlock(saveIndex, 1)
            }})
        }})

        // Mod mail
        self.manager.registerSeries(['hic sunt dracones', "just checkin' the mail", '<a href="https://www.youtube.com/watch?v=amRXYuAO-Do" target="_blank">Mr. Postman</a>', "You've got mail!"], 'Checked mod mail {0} times!', [1, 100, 1000, 10000], |saveIndex|{{
            if TB.utils.isModmail {
                self.manager.unlock(saveIndex, 1)
            }
        }})

        // Empty queue
        self.manager.registerSeries(['kitteh get!', 'puppy power!','<a href="https://www.youtube.com/watch?v=Fdc765l9psM" target="_blank">Dr. Jan Itor</a>', '/u/Kylde'], 'Cleared your queues {0} times!', [10, 50, 100, 700], |saveIndex|{{
            if TBUtils.isModpage and $body.find('p#noresults').length > 0 {
                self.manager.unlock(saveIndex, 1)
            }
        }})

        // Found flying Snoo
        self.manager.register('Cadbury Bunny', 'Found flying Snoo.', |saveIndex|{{
            TB.utils.catchEvent(TB.utils.events.TB_FLY_SNOO, {{
                self.manager.unlock(saveIndex)
            }})
        }})

        // Killed Snoo
        self.manager.register('you bastard!', 'Killed Snoo.', |saveIndex|{{
            TB.utils.catchEvent(TB.utils.events.TB_KILL_SNOO, {{
                self.manager.unlock(saveIndex)
            }})
        }})
    }}

    TB.register_module(self)
}

{{
    window.addEventListener('TBModuleLoaded', {{
        achievements()
    }})
}}
