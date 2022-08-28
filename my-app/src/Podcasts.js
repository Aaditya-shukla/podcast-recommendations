import axios from 'axios';
import Marquee from "react-fast-marquee";

import "./Home.css"
import { useState, useEffect, useRef } from 'react';
import {
    CardImg, Row, Container, Col, Card, Button, Flex,
    InputGroup, Form, Collapse, CardGroup
} from 'react-bootstrap';
import {
    Route,
    Navigate,
    Link
} from "react-router-dom";
// import Container from 'react-bootstrap/Container'
let itemList = [], password = "", suggestPodcast = [];
let rendered = true
// let [searchPodcasts, setSearchPodcasts] = ["", ""];
// let commentsRef
const Podcasts = (e) => {
    //  commentsRef = useRef(null);
    // [searchPodcasts, setSearchPodcasts] = useState("");
    // useEffect(() => {
    if (rendered) {
        // rendered = false

        let data = localStorage.getItem('podcasts');
        if (data) {
            data = JSON.parse(data)
        }

        let suggestedPodcast = localStorage.getItem('suggestedPodcasts');
        if (suggestedPodcast) {
            suggestedPodcast = JSON.parse(suggestedPodcast)
        }

        const repeatCheck = data.map(i => i.title)
        suggestedPodcast = suggestedPodcast.filter(i => !repeatCheck.includes(i.title))
        // data.slice(0,data.length/2)
        console.log("****suggestPodcast", suggestedPodcast)

         suggestedPodcast.forEach((item, index) => {
            const data = <Card
                // style={{ marginRight: 10 + 'em' }}
                bg="dark">
                <Row className="d-flex align-self-end g-0" style={{ height: '150px' }} sm="3"  >

                    <CardImg
                        className="position-relative  g-0 bg-light"
                        src={item.image}//"https://picsum.photos/318/180"
                        // style={{ marginRight: 18 + 'em' }}
                        // style={{height: '10px'}}
                        height="150"
                        onClick={() => listEpisodes(item.href)}

                    // onClick={() => alert("Hello from here")}

                    ></CardImg>
                </Row>
            </Card>
            suggestPodcast.push(data)
        })
         data.forEach((item, index) => {

            itemList.push(

                // <Card className="d-flex p-2 bd-highlight"
                //     // style={{ marginRight: 10 + 'em' }}
                //     bg="light">
                //     <Row className="d-flex p-2 bd-highlight g-0" 
                //     style={{ height: '150px' }} sm="3" 
                //      >
                //     <Col className="d-flex p-2 bd-highlight" md="auto">
                //         <CardImg
                //             className="d-flex p-2 bd-highlight  g-0 bg-light"
                //             src={item.image}//"https://picsum.photos/318/180"
                //             // style={{ marginRight: 18 + 'em' }}
                //             // style={{height: '300px'}}
                //             height="250"
                //         ></CardImg>
                //         </Col>
                //         <Col md="auto">
                //         <Card className="d-flex p-2 bd-highlight">
                //             {item.title}
                //             {item.artistName}
                //             </Card>

                //         </Col>
                //     </Row>
                // </Card>

                <Row className="d-flex flex-row bd-highlight g-0" >
                    <Col md="auto">
                        <Card className="d-flex flex-row bd-highlight g-0" style={{ width: '15rem' }} >
                            <Card.Img src={item.image} alt="Card image"
                                style={{ height: '150px' }}
                                onClick={() => listEpisodes(item.href)}
                            />
                            {/* <Card.ImgOverlay>
                  <Card.Title>{item.title}</Card.Title>
                  <Card.Text>
                    This is a wider card with supporting text below as a natural lead-in
                    to additional content. This content is a little bit longer.
                  </Card.Text>
                  <Card.Text>{item.artistName}</Card.Text>
                </Card.ImgOverlay> */}
                        </Card>
                    </Col>
                    <Col>
                        {/* <CardGroup>
                        <Card >
                            <Card.Img className="position-relative  g-0 bg-light" variant="top" src={item.image} height="150" width="50" />
                            <Card.Body>
                                <Card.Title>{item.title}</Card.Title>
                                <Card.Text>
                                    {item.artistName}
                                </Card.Text>
                            </Card.Body>
                            <Card.Footer>
                                <small className="text-muted">Last updated 3 mins ago</small>
                            </Card.Footer>
                        </Card>
                    </CardGroup> */}

                        <Card className="mb-2 g-0" style={{ width: '30rem' }}>
                            {/* <Card.Img src={item.image} alt="Card image" /> */}
                            {/* <Card.ImgOverlay> */}
                            <Card.Title>Title : {item.title}</Card.Title>
                            {/* <Card.Text>
                    This is a wider card with supporting text below as a natural lead-in
                    to additional content. This content is a little bit longer.
                  </Card.Text> */}
                            <Card.Subtitle className="mt-5 ">Artist Name : {item.artistName}</Card.Subtitle>
                            {/* </Card.ImgOverlay> */}
                        </Card>


                    </Col>
                </Row>

            )
        })

            return (
                <>
                    <Row>
                        <Card className="pagetop">
                            Podcasts
                </Card>
                    </Row>
                    <Row className="justify-content-md-center">
                        <Col md="auto">
                            <p className="text">Your Searched Podcasts</p>
                        </Col>
                    </Row>
                    {itemList}
                                 <Row>
                   
                        <p className="text mt-10"> Podcasts You may like</p>
                        <Marquee speed={10} pauseOnHover="true">
                            {suggestPodcast}
                        </Marquee>
                    </Row>



                </>
            );
    }
}

const listEpisodes = (feedUrl, check = true) => {
    
    axios.post(`http://localhost:5000/api/v0/fetchPodcastsEpisodes`,
        {
            feedUrl: feedUrl
        }).then(response => {
            if (check) {
                localStorage.setItem('epispdes', JSON.stringify(response.data));

                window.location.assign("/episodes")
            }
        })
}


export { Podcasts, listEpisodes };