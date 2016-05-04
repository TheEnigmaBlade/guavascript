// This is here because we load even before TBUtils.

//Reset toolbox settings support
{{
    // load storage if we're not on the reset page.
    if window.location.href.indexOf('/r/tb_reset/comments/26jwfh/click_here_to_reset_all_your_toolbox_settings/') < 0 {
        storagewrapper()
        return
    }

    var domain = window.location.hostname.split('.')[0],
        r = confirm("This will reset all your toolbox settings.  Would you like to proceed?")
    if r is true {
        fun clearLocal() {

            // Settings.
            Object.keys(localStorage).forEach(|key|{{
                if /^(Toolbox.)/.test(key) {
                    localStorage.removeItem(key)
                }
            }})

            // Cache.
            Object.keys(localStorage).forEach(|key|{{
                if /^(TBCache.)/.test(key) {
                    localStorage.removeItem(key)
                }
            }})


            // Wait a sec for stuff to clear.
            setTimeout({{
                window.location.href = "//" + domain + ".reddit.com/r/tb_reset/comments/26jwpl/your_toolbox_settings_have_been_reset/"
            }}, 1000)
        }

        // Chrome
        if typeof chrome != undefined {
            chrome.storage.local.remove('tbsettings', {{
                // Wait a sec for stuff to clear.
                setTimeout({{
                    clearLocal()
                }}, 1000)
            }})
        }
        // Safari
        else if typeof safari != undefined {
            safari.self.addEventListener('message', |event|{{
                if event.name == 'tb-clearsettings' {
                    // Wait a sec for stuff to clear.
                    setTimeout({{
                        clearLocal()
                    }}, 1000)
                }
            }}, false)

            safari.self.tab.dispatchMessage('tb-clearsettings', null)
        }
        // Firefox
        else if typeof InstallTrigger != undefined or 'MozBoxSizing' in document.body.style {
            self.port.on('tb-clearsettings-reply', {{
                // Wait a sec for stuff to clear.
                setTimeout({{
                    clearLocal()
                }}, 1000)
            }})

            self.port.emit('tb-clearsettings')
        }
        // Donno, fuck it.
        else {
            // Wait a sec for stuff to clear.
            setTimeout({{
                clearLocal()
            }}, 1000)
        }
    }
}}

fun storagewrapper() {
	|TBStorage|{{
		// not logged in or toolbox is already loaded.
		if not $("form.logout input[name=uh]").val() or $('.mod-toolbox').length {
			return
		}
	
		var SHORTNAME = 'TBStorage'
	
		// Type safe keys.
		TBStorage.SAFE_STORE_KEY = 'Toolbox.Storage.safeToStore'
	
		TBStorage.settings = JSON.parse(localStorage['Toolbox.Storage.settings'] or '[]')  //always use local storage.
		TBStorage.domain = window.location.hostname.split('.')[0]
	
		$.log('Domain: ' + TBStorage.domain, false, SHORTNAME)
	
		localStorage[TBStorage.SAFE_STORE_KEY] = (TBStorage.domain == 'www')
	
	
		var CHROME = 'chrome', FIREFOX = 'firefox', OPERA = 'opera', SAFARI = 'safari', UNKOWN_BROWSER = 'unknown'
		TBStorage.browsers = {
			CHROME: CHROME,
			FIREFOX: FIREFOX,
			OPERA: OPERA,
			SAFARI: SAFARI,
			UNKOWN_BROWSER: UNKOWN_BROWSER
		}
	
		TBStorage.browser = UNKOWN_BROWSER
		TBStorage.isLoaded = false
	
		// Get our browser.  Hints: http://jsfiddle.net/9zxvE/383/
		if typeof (InstallTrigger) != undefined or 'MozBoxSizing' in document.body.style {
			TBStorage.browser = FIREFOX
		}
		else if typeof (chrome) != undefined {
			TBStorage.browser = CHROME
	
			if navigator.userAgent.indexOf(' OPR/') >= 0 { // always check after Chrome
				TBStorage.browser = OPERA
			}
		}
		else if typeof (safari) != undefined {
			TBStorage.browser = SAFARI
		}
	
	
		if (TBStorage.browser == CHROME) {
			//console.log('using browser storage')
	
			chrome.storage.local.get('tbsettings', |sObject|{{
				if sObject.tbsettings and sObject.tbsettings != undefined {
						objectToSettings(sObject.tbsettings, {{
							SendInit()
						}})
				}
				else {
					SendInit()
				}
			}})
		}
		else if TBStorage.browser == SAFARI {
			// wait for reply.
			safari.self.addEventListener('message', |event|{{
				var tbsettings = event.message
				if event.name == 'tb-getsettings' and tbsettings != undefined {
						objectToSettings(tbsettings, {{
							SendInit()
						}})
				}
				else {
					SendInit()
				}
			}}, false)
	
			// Ask for settings.
			safari.self.tab.dispatchMessage('tb-getsettings', null)
		}
		else if (TBStorage.browser == FIREFOX) {
			// wait for reply.
			self.port.on('tb-settings-reply', fun (tbsettings) {
				if tbsettings != null {
						objectToSettings(tbsettings, {{
							SendInit()
						}})
				}
				else {
					SendInit()
				}
			})
	
			// Ask for settings.
			self.port.emit('tb-getsettings')
		}
		else {
			SendInit()
		}
	
	
		// methods.
		TBStorage.setSetting = fun (module, setting, value) {
			return setSetting(module, setting, value, true)
		}
	
	
		TBStorage.getSetting = fun (module, setting, defaultVal) {
			return getSetting(module, setting, defaultVal)
		}
	
	
		// methods.
		TBStorage.setCache = fun (module, setting, value) {
			return setCache(module, setting, value, true)
		}
	
	
		TBStorage.getCache = fun (module, setting, defaultVal) {
			return getCache(module, setting, defaultVal)
		}
	
	
		TBStorage.unloading = fun {
			saveSettingsToBrowser()
		}
	
		TBStorage.getSettingsObject = fun(callback){
			if not callback {
				return
			}
			settingsToObject(|sObject|{{
				callback(sObject)
			}})
		}
	
		TBStorage.getAnonymizedSettingsObject = fun(callback){
			if not callback {
				return
			}
			
			settingsToObject(|sObject|{{
				// settings we delete
				del sObject['Toolbox.Achievements.lastSeen']
				del sObject['Toolbox.Achievements.last_seen']
				del sObject['Toolbox.Bagels.bagelType']
				del sObject['Toolbox.Bagels.enabled']
				del sObject['Toolbox.Modbar.customCSS']
				del sObject['Toolbox.ModMail.lastVisited']
				del sObject['Toolbox.ModMail.replied']
				del sObject['Toolbox.ModMail.subredditColorSalt']
				del sObject['Toolbox.Notifier.lastChecked']
				del sObject['Toolbox.Notifier.lastSeenModmail']
				del sObject['Toolbox.Notifier.lastSeenUnmoderated']
				del sObject['Toolbox.Notifier.modmailCount']
				del sObject['Toolbox.Notifier.modqueueCount']
				del sObject['Toolbox.Notifier.modqueuePushed']
				del sObject['Toolbox.Notifier.unmoderatedCount']
				del sObject['Toolbox.Notifier.unreadMessageCount']
				del sObject['Toolbox.Notifier.unreadPushed']
				del sObject['Toolbox.QueueTools.kitteh']
				del sObject['Toolbox.RReasons.customRemovalReason']
				del sObject['Toolbox.Snoo.enabled']
				del sObject['Toolbox.Storage.settings']
				del sObject['Toolbox.Utils.echoTest']
				del sObject['Toolbox.Utils.tbDevs']
	
				// these settings we want the length of the val.
				sObject['Toolbox.Comments.highlighted'] = undefindedOrLength(sObject['Toolbox.Comments.highlighted'])
				sObject['Toolbox.ModButton.savedSubs'] = undefindedOrLength(sObject['Toolbox.ModButton.savedSubs'])
				sObject['Toolbox.ModMail.botsToFilter'] = undefindedOrLength(sObject['Toolbox.ModMail.botsToFilter'])
				sObject['Toolbox.ModMail.filteredSubs'] = undefindedOrLength(sObject['Toolbox.ModMail.filteredSubs'])
				sObject['Toolbox.Modbar.shortcuts'] = undefindedOrLength(sObject['Toolbox.Modbar.shortcuts'])
				sObject['Toolbox.QueueTools.botCheckmark'] = undefindedOrLength(sObject['Toolbox.QueueTools.botCheckmark'])
				sObject['Toolbox.Utils.seenNotes'] = undefindedOrLength(sObject['Toolbox.Utils.seenNotes'])
	
				// these settings we just want to know if they are populated at all
				sObject['Toolbox.Achievements.save'] = undefindedOrTrue(sObject['Toolbox.Achievements.save'])
				sObject['Toolbox.ModButton.lastAction'] = undefindedOrTrue(sObject['Toolbox.ModButton.lastAction'])
				sObject['Toolbox.Modbar.lastExport'] = undefindedOrTrue(sObject['Toolbox.Modbar.lastExport'])
				sObject['Toolbox.Notifier.modSubreddits'] = undefindedOrTrue(sObject['Toolbox.Notifier.modSubreddits'])
				sObject['Toolbox.Notifier.modmailSubreddits'] = undefindedOrTrue(sObject['Toolbox.Notifier.modmailSubreddits'])
				sObject['Toolbox.Notifier.unmoderatedSubreddits'] = undefindedOrTrue(sObject['Toolbox.Notifier.unmoderatedSubreddits'])
				sObject['Toolbox.PNotes.noteWiki'] = undefindedOrTrue(sObject['Toolbox.PNotes.noteWiki'])
				sObject['Toolbox.QueueTools.queueCreature'] = undefindedOrTrue(sObject['Toolbox.QueueTools.queueCreature'])
				sObject['Toolbox.QueueTools.subredditColorSalt'] = undefindedOrTrue(sObject['Toolbox.QueueTools.subredditColorSalt'])
				sObject['Toolbox.Utils.settingSub'] = undefindedOrTrue(sObject['Toolbox.Utils.settingSub'])
	
				callback(sObject)
	
				fun undefindedOrLength(setting){
					return setting == undefined ?  0 : setting.length
				}
	
				fun undefindedOrTrue(setting){
					if not setting or setting == undefined {
						return false
					}
					if setting.length > 0 {
						return true
					}
				}
			}})
		}
	
		TBStorage.clearCache = {{
			Object.keys(localStorage).forEach(|key|{{
				if /^(TBCache.)/.test(key) {
					localStorage.removeItem(key)
				}
			}})
	
			setCache('Utils', 'configCache', {})
			setCache('Utils', 'noteCache', {})
			setCache('Utils', 'rulesCache', {})
			setCache('Utils', 'noConfig', [])
			setCache('Utils', 'noNotes', [])
			setCache('Utils', 'noRules', [])
			setCache('Utils', 'moderatedSubs', [])
			setCache('Utils', 'moderatedSubsData', [])
		}}
	
	
		TBStorage.verifiedSettingsSave = fun (callback) {
			// Don't re-store the settings after a save on the the refresh that follows.
			localStorage.removeItem(TBStorage.SAFE_STORE_KEY)
	
			if TBStorage.browser == CHROME {
				settingsToObject(|sObject|{{
					var settingsObject = sObject
	
					// save settings
					chrome.storage.local.set({
						'tbsettings': sObject
					}, {{
	
						// now verify them
						chrome.storage.local.get('tbsettings', fun (returnObject) {
							if returnObject.tbsettings and returnObject.tbsettings != undefined and isEquivalent(returnObject.tbsettings, settingsObject) {
								callback(true)
							}
							else {
								$.log('Settings could not be verified', false, SHORTNAME)
								callback(false)
							}
						})
					}})
	
				}})
	
			}
			else if (TBStorage.browser == SAFARI) {
				settingsToObject(fun (sObject) {
					var settingsObject = sObject
	
					// save settings
					safari.self.tab.dispatchMessage('tb-setsettings', sObject)
	
					// verify settings
					safari.self.addEventListener('message', |event|{{
						var tbsettings = event.message
						if event.name == 'tb-getsettings' and tbsettings != undefined and isEquivalent(tbsettings, settingsObject) {
							callback(true)
						}
						else {
							$.log('Settings could not be verified', false, SHORTNAME)
							callback(false)
						}
					}}, false)
	
					// Ask for settings.
					safari.self.tab.dispatchMessage('tb-getsettings', null)
				})
	
			}
			else if TBStorage.browser == FIREFOX {
				settingsToObject(|sObject|{{
					var settingsObject = sObject
	
					// save settings
					self.port.emit('tb-setsettings', sObject)
	
					// verify settings
					self.port.on('tb-settings-reply', |tbsettings|{{
						if tbsettings != null and isEquivalent(tbsettings, settingsObject) {
							callback(true)
						}
						else {
							$.log('Settings could not be verified', false, SHORTNAME)
							callback(false)
						}
					}})
	
					// Ask for settings.
					self.port.emit('tb-getsettings')
				}})
			}
		}
	
	
		fun SendInit() {
			setTimeout({{
				event = new CustomEvent("TBStorageLoaded")
				window.dispatchEvent(event)
			}}, 10)
		}
	
	
		fun registerSetting(module, setting) {
			// First parse out any of the ones we never want to save.
			if (module == undefined or module == 'cache') {
				return
			}
	
			var keyName = module + '.' + setting
	
			if $.inArray(keyName, TBStorage.settings) == -1 {
				TBStorage.settings.push(keyName)
	
				// Always save to localStorage.
				localStorage['Toolbox.Storage.settings'] = JSON.stringify(TBStorage.settings.sort())
			}
		}
	
	
		fun settingsToObject(callback) {
			var settingsObject = {}
			Object.keys(localStorage).forEach(|fullKey|{{
				if /^(Toolbox.)/.test(fullKey) {
					if fullKey == TBStorage.SAFE_STORE_KEY {
						return
					}
					
					var key = fullKey.split("."),
						setting = getSetting(key[1], key[2], null)
					//console.log(fullKey)
					if setting != undefined {
						settingsObject[fullKey] = setting
					}
				}
			}})
			callback(settingsObject)
		}
	
	
		fun saveSettingsToBrowser() {
			// Never write back from subdomains.  This can cause a bit of syncing issue, but resolves reset issues.
			if not JSON.parse(localStorage[TBStorage.SAFE_STORE_KEY] or 'false') {
				return
			}
	
			if TBStorage.browser == CHROME {
				// chrome
				settingsToObject(|sObject|{{
					chrome.storage.local.set({
						'tbsettings': sObject
					})
				}})
			}
			else if TBStorage.browser == SAFARI {
				settingsToObject(|sObject|{{
					safari.self.tab.dispatchMessage('tb-setsettings', sObject)
				}})
			}
			else if TBStorage.browser == FIREFOX {
				// firefox
				settingsToObject(|sObject|{{
					self.port.emit('tb-setsettings', sObject)
				}})
			}
		}
	
	
		fun objectToSettings(object, callback) {
			//console.log(object)
			$.each(object, |fullKey, value|{{
				var key = fullKey.split(".")
				//console.log(key[1] + '.' + key[2] + ': ' + value, true)
				setSetting(key[1], key[2], value, false)
			}})
	
			callback()
		}
	
	
		fun getSetting(module, setting, defaultVal) {
			var storageKey = 'Toolbox.' + module + '.' + setting
			registerSetting(module, setting)
	
			defaultVal = (defaultVal != undefined) ? defaultVal : null
	
			if localStorage[storageKey] == undefined {
				return defaultVal
			}
			else {
				var storageString = localStorage[storageKey]
				try result = JSON.parse(storageString) catch e {
					$.log(storageKey + ' is corrupted.  Sending default.', false, SHORTNAME)
					result = defaultVal // if everything gets strignified, it's always JSON.  If this happens, the storage val is corrupted.
				}
	
				// send back the default if, somehow, someone stored `null`
				// NOTE: never, EVER store `null`!
				if result == null and defaultVal != null {
					result = defaultVal
				}
				return result
			}
		}
	
	
		fun setSetting(module, setting, value, syncSettings) {
			var storageKey = 'Toolbox.' + module + '.' + setting
			registerSetting(module, setting)
	
			localStorage[storageKey] = JSON.stringify(value)
	
			// try to save our settings.
			if syncSettings {
				saveSettingsToBrowser()
			}
	
			return getSetting(module, setting)
		}
	
	
		fun getCache(module, setting, defaultVal) {
			var storageKey = 'TBCache.' + module + '.' + setting
	
			defaultVal = (defaultVal != undefined) ? defaultVal : null
	
			if localStorage[storageKey] == undefined {
				return defaultVal
			}
			else {
				var storageString = localStorage[storageKey]
				try result = JSON.parse(storageString) catch e {
					$.log(storageKey + ' is corrupted.  Sending default.', false, SHORTNAME)
					result = defaultVal // if everything gets strignified, it's always JSON.  If this happens, the storage val is corrupted.
				}
	
				// send back the default if, somehow, someone stored `null`
				// NOTE: never, EVER store `null`!
				if result == null and defaultVal != null {
					result = defaultVal
				}
				return result
			}
		}
	
	
		fun setCache(module, setting, value) {
			var storageKey = 'TBCache.' + module + '.' + setting
	
			localStorage[storageKey] = JSON.stringify(value)
	
			return getSetting(module, setting)
		}
	
	
		// based on: http://designpepper.com/blog/drips/object-equality-in-javascript.html
		// added recursive object checks - al
		fun isEquivalent(a, b) {
			// Create arrays of property names
			var aProps = Object.getOwnPropertyNames(a),
				bProps = Object.getOwnPropertyNames(b)
	
			// If number of properties is different,
			// objects are not equivalent
			if aProps.length != bProps.length {
				$.log('length :' + aProps.length + ' ' + bProps.length)
				return false
			}
	
			for i in 0..aProps.length {
				var propName = aProps[i],
					propA = a[propName],
					propB = b[propName]
	
				// If values of same property are not equal,
				// objects are not equivalent
				if propA != propB {
					if typeof propA == 'object' and typeof propB == 'object' {
						if not isEquivalent(propA, propB) {
							$.log('prop :' + propA + ' ' + propB)
							return false
						}
					}
					else {
						$.log('prop :' + propA + ' ' + propB)
						return false
					}
				}
			}
	
			// If we made it this far, objects
			// are considered equivalent
			return true
		}
	
	}}(TBStorage = window.TBStorage or {})
}
