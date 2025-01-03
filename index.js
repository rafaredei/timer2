import React, {useState, useEffect} from 'react';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'
import { StyleSheet, View, Image, Text, FlatList, TextInput, TouchableOpacity, Modal, ScrollView} from 'react-native';
import * as Speech from 'expo-speech'
import TextTicker from 'react-native-text-ticker'
import { Easing } from 'react-native';
const playButtonImg = require("./assets/play-button.png");
const smallPlayImg = require("./assets/smallplay.png")
const pauseImg = require("./assets/pause.png")
const skipImg = require("./assets/skip.png")

const routineList = [
  { id: '0', text: 'satoru gojo', timers: [{timerID: '0', name: "get ready", duration: "00:10"}], completions: 0 },
];

const App = () => {
  
  const [isEditPageVisible, setIsEditPageVisible] = useState(false); //handles bringing up edit page
  const [isPlayPageVisible, setIsPlayPageVisible] = useState(false);
  const [isCompletePageVisible, setIsCompletePageVisible] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState(null); //handles selected routines
  const [selectedTimer, setSelectedTimer] = useState(null); //handles selected timer
  const [name, setName] = useState(" ");
  const [routineListState, setRoutineListState] = useState(routineList);
  const [currentTimerIndex, setCurrentTimerIndex] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [key, setKey] = useState(0)
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [isHalfway, setIsHalfway] = useState(false);
  const [isOneSecond, setIsOneSecond] = useState(false);
  const [isTwoSecond, setIsTwoSecond] = useState(false);
  const [isThreeSecond, setIsThreeSecond] = useState(false);

  const addRoutine = () => { //adds new routines
    setIsEditPageVisible(true);
    const newRoutine = { id: `${routineList.length}`, text: "new routine", timers: [{timerID: '0', name: "get ready", duration: "00:10"}], completions: 0 };
    routineList.push(newRoutine);
    setRoutineListState[[...routineList]]
    setSelectedRoutine(newRoutine);
  }

  const routinePress = (item) => {
    /*
    setSelectedRoutine((prevSelectedRoutine) => {
      // Toggle the selection
      return prevSelectedRoutine === item ? null : item;
    });
    */
   setSelectedRoutine(item)
  };

  const timerPress = (item) => {
    setSelectedTimer(item)
  }
 
  const deleteRoutine = (index) => {
    routineList.splice(index, 1); //remove selected routine from list
    for (let i = index; i < routineList.length; i++) { //decrement all id's by 1 that come after deleted routine
        routineList[i].id--;
    }
    setSelectedRoutine(null);
    setIsEditPageVisible(false);
    setRoutineListState(routineList);
  }

  const renameRoutine = (newName) => {
    if (selectedRoutine) {
      timers = selectedRoutine.timers;
      selectedRoutine.text = newName; //updates selected routine and list itself
      setSelectedRoutine({ ...selectedRoutine });
      index = selectedRoutine.id;
      routineList[index].text = newName;
      routineList[index].timers = timers;
      setRoutineListState({...routineList});
    }
  }

  const renameTimer = (newName, item) => {
    routineIndex = selectedRoutine.id;
    timerIndex = item.timerID;
    const updatedRoutineList = [...routineList]
    updatedRoutineList[routineIndex].timers[timerIndex].name = newName
    setRoutineListState(updatedRoutineList)
  }

  const chooseDuration = (newDuration, item) => {
    routineIndex = selectedRoutine.id;
    timerIndex = item.timerID;
    const updatedRoutineList = [...routineList]
    updatedRoutineList[routineIndex].timers[timerIndex].duration = newDuration
    setRoutineListState(updatedRoutineList)
  }

  const deleteTimer = (item) => {
    if (selectedRoutine.timers.length > 1) {
      routineIndex = selectedRoutine.id;
      timerIndex = item.timerID;
      const updatedRoutineList = [...routineList]
      updatedRoutineList[routineIndex].timers.splice(timerIndex, 1)
      for (let i = timerIndex; i < updatedRoutineList[routineIndex].timers.length; i++) { //decrement all id's by 1 that come after deleted routine
        updatedRoutineList[routineIndex].timers[i].timerID--;
      }
      setRoutineListState(updatedRoutineList)
    }
    
  }

  const copyTimer = (item) => {
    const newTimer = {timerID: `${selectedRoutine.timers.length}`, name: item.name, duration: item.duration};
    routineIndex = selectedRoutine.id;
    const updatedRoutineList = [...routineList]
    updatedRoutineList[routineIndex].timers.push(newTimer)
    setRoutineListState(updatedRoutineList)
  }

  const playRoutine = () => {
    setIsPlayPageVisible(true)
    setCurrentTimerIndex(0)
    setTimerRunning(true)
    setKey(0)
    Speech.speak(selectedRoutine.timers[currentTimerIndex].name)
    setIsHalfway(false)
    setIsOneSecond(false)
    setIsTwoSecond(false)
    setIsThreeSecond(false)
  }
  
  const children = ({ remainingTime }) => { //format remaining time
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    if (remainingTime === Math.ceil((convert(selectedRoutine.timers[currentTimerIndex].duration) / 2)) && (!isHalfway)) {
      Speech.speak("halfway there");
      setIsHalfway(true)
    }
    if (remainingTime === 3 && !isThreeSecond) {
      Speech.speak("3");
      setIsThreeSecond(true)
    }
    if (remainingTime === 2 && !isTwoSecond) {
      Speech.speak("2");
      setIsTwoSecond(true)
    }
    if (remainingTime === 1 && !isOneSecond) {
      Speech.speak("1");
      setIsOneSecond(true)
    }
    return (
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 40, fontWeight: 'bold' }}>{`${formattedMinutes}:${formattedSeconds}`}</Text>
        <Text style={{ fontSize: 16, marginTop: 5 }}>Remaining</Text>
      </View>
    );
  };

  const onComplete = () => {
    if (selectedRoutine.timers[currentTimerIndex + 1]) {
      setCurrentTimerIndex(currentTimerIndex + 1)
      setTimerRunning(true)
      setKey(key + 1) //makes the timer properly reset for some reason
      Speech.speak(selectedRoutine.timers[currentTimerIndex + 1].name)
    } else {
      setTimerRunning(false)
      setIsPlayPageVisible(false)
      setIsCompletePageVisible(true)
      setCurrentTimerIndex(0)
      selectedRoutine.completions++
      //setKey(0) //ends timer i think??
      Speech.speak("routine complete")
    }
    setIsHalfway(false)
    setIsOneSecond(false)
    setIsTwoSecond(false)
    setIsThreeSecond(false)
  }

  const checkTimer = () => {
    let flag = true
    if (selectedRoutine.timers.length === 0) {
      flag = false;
    }
    for (let i = 0; i < selectedRoutine.timers.length; i++) {
      const timer = selectedRoutine.timers[i];
      if (/^[0-9]:[0-5][0-9]$/.test(timer.duration)) {
        chooseDuration("0" + timer.duration, timer)
      }
      if (timer.name.length <= 0 || !(/^[0-5][0-9]:[0-5][0-9]$/.test(timer.duration)) || timer.duration == "00:00") {
        flag = false
      }
    }
    if (flag) {
      setIsEditPageVisible(false);
    }
  };

  const convert = (duration) => {
    const [minutes, seconds] = duration.split(':');
    const total = (parseInt(minutes) * 60) + parseInt(seconds);
    return total;
  }

  const pauseTimer = () => {
    setIsTimerPaused(!isTimerPaused)
    setTimerRunning(!timerRunning)
  }

  const skipBack = () => {
    if (isTimerPaused) {
      setIsTimerPaused(!isTimerPaused)
      setTimerRunning(!timerRunning)
    }
    if (currentTimerIndex === 0) {
      setKey(key - 1)
      Speech.speak(selectedRoutine.timers[currentTimerIndex].name)
    } else {
      setCurrentTimerIndex(currentTimerIndex - 1)
      setTimerRunning(true)
      setKey(key - 1)
      Speech.speak(selectedRoutine.timers[currentTimerIndex - 1].name)
    }
    setIsHalfway(false)
    setIsOneSecond(false)
    setIsTwoSecond(false)
    setIsThreeSecond(false)
  }

  const skipForward = () => {
    if (isTimerPaused) {
      setIsTimerPaused(!isTimerPaused)
      setTimerRunning(!timerRunning)
    }
    onComplete()
  }

  const cancelRoutine = () => {
    if (isTimerPaused) {
      setIsTimerPaused(!isTimerPaused)
      setTimerRunning(!timerRunning)
    }
    setTimerRunning(false)
    setIsPlayPageVisible(false)
    setCurrentTimerIndex(0)
  }


  return (
    //play button and selected routine
    <View style={{justifyContent: 'center', alignItems: 'center', flex: 1 }}>
      <TouchableOpacity
        onPress={() => {
            if (selectedRoutine !== null) {
              playRoutine();
            }
          }} 
          activeOpacity={selectedRoutine !== null ? 0.5 : 1}
          >
        <Image
          source={playButtonImg}
          style={{width: 200, height: 200 }}
          />
      </TouchableOpacity>

      <Modal
      visible={isCompletePageVisible}
      onRequestClose={() => setIsCompletePageVisible(false)}
      presentationStyle='fullscreen'
      >
        <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
          <Text>Well done! You've completed this routine {selectedRoutine ? selectedRoutine.completions : 0} {selectedRoutine && selectedRoutine.completions === 1 ? "time" : "times" }</Text>
          <TouchableOpacity onPress={() => setIsCompletePageVisible(false)}>
              <Text style={{fontSize:30, paddingTop: 50}}>✓</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
      visible={isPlayPageVisible}
      onRequestClose={() => setIsPlayPageVisible(false)}
      presentationStyle='fullscreen'
      >
        <View style={{paddingLeft: 30, paddingTop: 60}}>
          <TouchableOpacity onPress={() => cancelRoutine()}>
              <Text style={{fontSize: 15}}>cancel</Text>
          </TouchableOpacity>
        </View>
        <View style={{flex: 1, alignItems: 'center', paddingTop:0}}>
            <Text style={{fontWeight: 'bold', fontSize: 40, paddingBottom: 0}}>
              {selectedRoutine && selectedRoutine.timers[currentTimerIndex] ?
                selectedRoutine.timers[currentTimerIndex].name :
                "Fallback Text"}
            </Text>
            <View style={{paddingTop: 70}}>
              <CountdownCircleTimer
                key={key} //somehow makes timer reset properly
                isPlaying={timerRunning}
                duration={isPlayPageVisible ? convert(selectedRoutine.timers[currentTimerIndex].duration) : 0}
                colors={['#004777', '#F7B801', '#A30000', '#A30000']}
                colorsTime={[7, 5, 2, 0]}
                size={300}  
                onComplete={() => onComplete()}
              >
                {children}
              </CountdownCircleTimer>
              <View style={{alignItems: 'center', paddingTop: 50}}>
                <Text style={{fontSize: 20}}>{selectedRoutine && selectedRoutine.timers[currentTimerIndex + 1] ? "up next:" : "final interval"}</Text>
                <TextTicker
                scrollSpeed={20}
                loop
                repeatSpacer={40}
                bounceDelay={1000}
                animationType='scroll'
                easing={Easing.linear}
              >
                <Text style={{fontSize: 35}}>{selectedRoutine && selectedRoutine.timers[currentTimerIndex + 1] ? selectedRoutine.timers[currentTimerIndex + 1].name : ""}</Text>
              </TextTicker>
              </View>
            </View>
            <View style={{flexDirection: 'row', paddingTop: 100}}>
              <View style={{paddingRight: 90}}>
                <TouchableOpacity
                  onPress={() => {
                      skipBack()
                    }} 
                    activeOpacity={.8}
                >
                  <Image
                    source={skipImg}
                    style={{width: 30, height: 30, transform: [{ scaleX: -1 }]}}
                    />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                onPress={() => {
                  pauseTimer()
                }} 
                activeOpacity={.8}
              >
                {isTimerPaused ? ( // Conditional rendering based on the pause state
                <Image source={smallPlayImg} style={{ width: 50, height: 50 }} />
                ) : (
                <Image source={pauseImg} style={{ width: 50, height: 50 }} />
                )}
              </TouchableOpacity>

              <View style={{paddingLeft: 90}}>
                <TouchableOpacity
                  onPress={() => {
                      if (selectedRoutine !== null) {
                        skipForward();
                      }
                    }} 
                    activeOpacity={.8}
                >
                  <Image
                    source={skipImg}
                    style={{width: 30, height: 30 }}
                    />
                </TouchableOpacity>
              </View>
            </View>
        </View>
      </Modal>

      <TextTicker
        scrollSpeed={20}
        loop
        repeatSpacer={40}
        bounceDelay={1000}
        animationType='scroll'
        easing={Easing.linear}
      >
        <Text style={{fontSize: 40, paddingTop: 20, paddingBottom: 20, fontWeight: 'bold'}}>{selectedRoutine ? selectedRoutine.text : " "}</Text>
      </TextTicker>

      <FlatList //list of routines
        data={routineList}
        renderItem={({item}) => {
          return (
              <TouchableOpacity
                key={item.id}
                onPress={() => routinePress(item)}
                activeOpacity={1}
                style={{backgroundColor: item.id === selectedRoutine?.id ? 'lightblue' : 'white'}}
              >
              <TextTicker
                scrollSpeed={20}
                loop
                repeatSpacer={40}
                bounceDelay={1000}
                animationType='scroll'
                easing={Easing.linear}
              >
                <Text style={{alignItems: 'center', fontSize: 30}}>{item.text}</Text>
              </TextTicker>
              </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text>Tap the "+" to create a new routine!</Text>}
        style={{height: 400, width: 300, maxHeight: 400, maxWidth: 300, borderColor: 'black', borderWidth: 2}}
      />

      <View style={{flexDirection: 'row'}}> 
        <TouchableOpacity
        onPress={() => {
          if (selectedRoutine !== null) {
            setIsEditPageVisible(true);
          }
        }} 
        activeOpacity={selectedRoutine !== null ? 0.5 : 1}
        style={{marginRight: 200}}
        >
          <Text style={{fontSize: 30, color: selectedRoutine ? 'black' : 'gray'}}>edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => addRoutine()}>
          <Text style={{fontSize:30}}>+</Text>
        </TouchableOpacity>
      </View>

      <Modal
      visible={isEditPageVisible}
      onRequestClose={() => setIsEditPageVisible(false)}
      animationType='slide'
      presentationStyle='fullscreen'
      >
        <View style={{alignItems: 'center', flex: 1, padding:40}}>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity onPress={() => deleteRoutine(selectedRoutine.id)}>
              <Text style={{fontSize: 30}}>-</Text>
            </TouchableOpacity>

            <View>
              <TextInput style={{height: 50, width: 300, fontSize: 25, textAlign: 'center', fontWeight: 'bold'}}
                value={selectedRoutine ? selectedRoutine.text : " "}
                //maxLength={21}
                onChangeText={(newName) => renameRoutine(newName)}
              />
              <View style={{paddingTop: 0}}>
                {selectedRoutine && (
                  <FlatList //list of timers
                  data={selectedRoutine.timers}
                  renderItem={({item}) => {
                    return (
                      <View style={{flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'cyan', padding: 5}}>
                        <View>
                          <TextInput style={{fontSize: 30, textAlign: 'left', fontWeight: 'bold', overflow: 'hidden'}}
                            value={item.name}
                            multiline
                            //maxLength={22}
                            onChangeText={(newName) => renameTimer(newName, item)}
                          />
                          <TextInput style={{fontSize: 30, textAlign: 'left', fontWeight: 'bold'}}
                            value={item.duration}
                            maxLength={5}
                            placeholder='01:30'
                            onChangeText={(duration) => chooseDuration(duration, item)}
                          />
                        </View>
                        <View>
                          <TouchableOpacity onPress={() => deleteTimer(item)}>
                            <Text style={{fontSize: 30}}>-</Text>
                          </TouchableOpacity>

                          <TouchableOpacity onPress={() => copyTimer(item)}>
                            <Text style={{fontSize: 30}}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  }}
                    ListEmptyComponent={<Text>Tap the "+" to create add a timer!</Text>}
                    style={{height: 700, width: 300, maxHeight: 1000, maxWidth: 400, borderColor: 'black', borderWidth: 2}}
                  />
                )}  
              </View>
            </View>
            <View>
              <TouchableOpacity onPress={() => checkTimer()}>
                <Text style={{fontSize:30}}>✓</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};



export default App;
