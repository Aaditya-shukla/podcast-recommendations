import Marquee from "react-fast-marquee";
import axios from 'axios';
import "./Home.css"
import { useState, useEffect, useRef } from 'react';
import {
    CardImg, Row, Container, Col, Card, Button, Flex,
    InputGroup, Form
} from 'react-bootstrap';
import {
    Link
} from "react-router-dom";
let itemList = [];
let [searchPodcasts, setSearchPodcasts] = ["", ""]
const Home = (e) => {
    [searchPodcasts, setSearchPodcasts] = useState("");

    useEffect(() => {
       
        axios.get("http://localhost:5000/api/v0/listpodcasts").then(response => {
            console.log("response", response)
    
            response.data.forEach((item, index) => {

                itemList.push(
                    <Card className="Login"
                        bg="dark">
                        <Row className="d-flex align-self-end g-0" style={{ height: '350px' }} sm="3"  >

                            <CardImg
                                className="position-relative  g-0 bg-light"
                                src={item.image}
                                height="350"
                            ></CardImg>
                        </Row>
                    </Card>
                )
            })

        }).catch(error => {
            console.log("error", error);

        });
    }, [])

    return (
        <>
            <Row>
                <Card className="pagetop">
                    Podcasts
                </Card>
            </Row>
            <Container>
                <Row className="justify-content-md-center">
                    <Col md="auto">
                        <p className="text">Listen to Your Favorite Podcasts</p>
                    </Col>
                </Row>
                <Row>
                    <Col xs lg="12">
                        <InputGroup className="mb-10"
                          
                            onChange={e => {
                                setSearchPodcasts(e.target.value);
                            }}
                        >
                            <Form.Control
                                placeholder="Search Podcasts"
                                aria-label="Recipient's username"
                                aria-describedby="basic-addon2"
                            />
                            <Button variant="outline-secondary" onClick={(e) => SearchPodcasts(e)}
                                value={searchPodcasts}
                                component={Link}
                                to="/dashboard"
                            >
                                Search
        </Button>
                        </InputGroup>
                    </Col>
                </Row>
            </Container>
            <Row xs lg="12">

            </Row>
            <Row  >
            <Marquee 
             speed={10} pauseOnHover="true" >
                {itemList}
            </Marquee>
            </Row>
        </>
    );
}

const suggestedPodcasts = async (searchPodcasts) => {

    axios.post(`http://localhost:5000/api/v0/recommendedPodcasts`,
        {
            name: searchPodcasts,
        }
    ).then(response => {
        localStorage.setItem('suggestedPodcasts', JSON.stringify(response.data));

    })
}

const SearchPodcasts = async (event) => {
    event.preventDefault();
    suggestedPodcasts(searchPodcasts)
    axios.get(`http://localhost:5000/api/v0/searchpodcasts?qs=${searchPodcasts}`).then(response => {
        localStorage.setItem('podcasts', JSON.stringify(response.data));

        window.location.assign("/dashboard")
    })
}


export default Home;