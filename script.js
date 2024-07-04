window.onload = () => {
    	

    
    let testEntityAdded = false;
    let tourGuideAdded = 0;
    let tourGuide;
    let spoke = 0;
    let happened = false;

    let markerLatitude;
    let markerLongitude;
    

    const model = document.querySelector('a-gltf-model');
    const camera1 = document.getElementById('main-camera')
    const camera2 = document.getElementById('model-camera')

// Pause all animations
// model.components['animation-mixer'].pause();

// Resume all animations
model.components['animation-mixer'].play();

// Stop all animations
// model.components['animation-mixer'].stop();

    function distance(pointA, pointB){
        return Math.sqrt((pointA[0]-pointB[0])^2 + (pointA[1]-pointB[1])^2);
    }

    async function tourGuidePosition(poiLat, poiLon, displacementMeters = 2) {
        let poiPosition = [poiLat, poiLon];
        let currentPosition = await getCurrentPosition();
    
        let totalDistance = distance(poiPosition, currentPosition);
        let directionVector = [(poiPosition[0] - currentPosition[0]), (poiPosition[1] - currentPosition[1])];
    
        
        let normalizedDirection = [directionVector[0] / totalDistance, directionVector[1] / totalDistance];
    
        // Convert the displacement to latitude and longitude units
        let displacementLatitude = (displacementMeters / 111111) * normalizedDirection[0];
        let displacementLongitude = (displacementMeters / (111111 * Math.cos(currentPosition[0] * (Math.PI / 180)))) * normalizedDirection[1];
    
        // Calculate the guide position 2 meters away in the direction of the POI
        console.log(displacementLatitude);
        let guidePosition = [
            currentPosition[0] + 0.0003,
            currentPosition[1] + 0.0003
        ];
        console.log(currentPosition[0]);
        console.log(guidePosition[0]);
        return guidePosition;
    }
    
    function getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => resolve([position.coords.latitude, position.coords.longitude]),
                (error) => reject(error)
            );
        });
    }
    
   
    const el = document.querySelector("[gps-new-camera]");

    
    const textOverlay = document.getElementById('text');

    el.addEventListener("gps-camera-update-position", async(e) => {
        if (!testEntityAdded) {
            try {
                const latitude = e.detail.position.latitude;
                const longitude = e.detail.position.longitude;

                
                const response = await fetch(`https://api.openstreetmap.org/api/0.6/map?bbox=${longitude - 0.002},${latitude - 0.002},${longitude + 0.002},${latitude + 0.002}`);
                const data = await response.text();

                // Parse the XML response from OSM
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(data, "text/xml");

                const targetTagAttribute = 'k';
                const targetTagValue = 'name';


                const allNodes = xmlDoc.querySelectorAll('node');

                // Filter nodes that contain a <tag> element with the specified attribute and value
                const nodesWithTargetTag = Array.from(allNodes).filter(node => {
                const tags = node.querySelectorAll(`tag[${targetTagAttribute}="${targetTagValue}"]`);
                return tags.length > 0;
                });

                console.log(nodesWithTargetTag);
                tourGuideAdded = 0;
                nodesWithTargetTag.forEach(node => {
                    const poiLatitude = parseFloat(node.getAttribute('lat'));
                    const poiLongitude = parseFloat(node.getAttribute('lon'));

                    // Create 3D models for each point of interest
                    const poiEntity = document.createElement("a-entity");
                    
                    
                    poiEntity.setAttribute('gps-new-entity-place', {
                        latitude: poiLatitude,
                        longitude: poiLongitude
                    });
                    
                    
                    poiEntity.setAttribute("gltf-model", "url(./assets/models/map_pointer_3d_icon.glb)");

                    document.querySelector("a-scene").appendChild(poiEntity);

                    // Add event listener for click on the point of interest
                    function processTags(node) {
                        if (node.nodeName === "tag") {
                            let name;
                            Array.from(node.attributes).forEach(attribute => {
                                if (attribute.nodeName === "k" && attribute.nodeValue === "name") {
                                    name = node.getAttribute("v");
                                }
                            });
                            if (name) {
                                textOverlay.innerHTML = name;
                            }
                        } else if (node.childNodes) {
                            node.childNodes.forEach(childNode => {
                                processTags(childNode);
                            });
                        }
                    }
                    let info;
                    async function processInformationTags(node) {
                        
                        if (node.nodeName === "tag") {
                            
                            
                            Array.from(node.attributes).forEach(attribute => {
                                if (attribute.nodeName === "k" && attribute.nodeValue === "information") {
                                    console.log("info set");
                                    info = node.getAttribute("v");
                                }
                            });
                            
                            tourGuideAdded = 0;
                        }
                        

                        
                    }
                    
                    
                    poiEntity.addEventListener('click', async function() {
                    if(!happened){
                        happened = true;
                        
                        node.childNodes.forEach(childNode => {
                            processTags(childNode);
                            console.log(spoke);
                            
                            processInformationTags(childNode)
                            
                            

                            
                            

                        });
                        
                        tourGuideAdded =0;
                        
                         
                        

                        markerLatitude = this.getAttribute('gps-new-entity-place').latitude;
                        markerLongitude =this.getAttribute('gps-new-entity-place').longitude;
                        
                        

                        // let tourGuideCoords = await tourGuidePosition(markerLatitude,markerLongitude);
                        // console.log(tourGuideCoords[0]);
                        // tourGuideCCC(tourGuideCoords[0], tourGuideCoords[1]);
                        let latitudeGuide;
                        let longitudeGuide;
                        if(tourGuideAdded === 0)
                        {

                            if(info){
                                console.log(text);
                                // if(spoke === 0){
                                    // spoke+=1;
                                    console.log("speaking");
                                    let speech = new SpeechSynthesisUtterance(info);
                                    window.speechSynthesis.speak(speech);
                                    speech.onend = () => {
                                        camera2.setAttribute("active","false");
                                        camera1.setAttribute("active","true");
                                    }
                                    console.log(tourGuideAdded);

                                // }
                            }
                            
                            
                            navigator.geolocation.getCurrentPosition(function(position) {
                                longitudeGuide = position.coords.longitude;
                                latitudeGuide = position.coords.latitude;
                            })
                            console.log("Button clicked");
                            // console.log(tourGuideCoords[0]);
                            // tourGuide = document.createElement('a-gltf-model');
                            // tourGuide.setAttribute("src", "./assets/models/man_one.glb");
                            // tourGuide.setAttribute('gps-new-entity-place', {
                            //     latitude: tourGuideCoords[0],
                            //     longitude: tourGuideCoords[1]
                            // });
                            // tourGuide.setAttribute('scale', '0.05 0.05 0.05');
                            
                            // Get reference to the model element
                            console.log(83);
                            camera2.setAttribute("active","true");
                            camera1.setAttribute("active","false")
                
                            // document.querySelector('a-scene').appendChild(tourGuide);
                            tourGuideAdded += 1;
                            // console.log(tourGuide);
                            console.log("Entity appended to scene");
                            // console.log(tourGuideAdded);
                            // console.log(tourGuide.getAttribute('scale'));
                            // setTimeout(function(){
                            //     if(tourGuideAdded)
                            //     {
                            //         document.querySelector('a-scene').removeChild(tourGuide);
                                    
                            //         console.log('removed');
                            //     }
                                
                            //     tourGuideAdded = 0;
                            // }, 10000)
                            

                        }
                        setTimeout(() => {
                            textOverlay.innerHTML = "";
                        }, 3000);

                        setTimeout(() => {
                            happened = false;
                        }, 2000);
                    }    
                    });
                    
                });
            } catch (error) {
                console.error("Error fetching and processing OSM data:", error);
            }

            testEntityAdded = true;

        }
    });
};