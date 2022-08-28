import Marquee from "react-fast-marquee";
import { listEpisodes } from "./Podcasts.js";
import ReactAudioPlayer from 'react-audio-player';
import "./Home.css"
import { useState, useEffect, useRef } from 'react';
import {
    CardImg, Row, Col, Card, CardGroup
} from 'react-bootstrap';

let itemList = [],  suggestPodcast = [], podcast = [];
let rendered = true
let [showPlayer, setshowPlayer] = ["", ""];
const MAX_POSSIBLE_HEIGHT = 500;

const Episodes = (e) => {
    [showPlayer, setshowPlayer] = useState(false);

    let data = localStorage.getItem('epispdes');
    if (data) {
        data = JSON.parse(data)
    }

    let suggestedPodcast = localStorage.getItem('suggestedPodcasts');
    if (suggestedPodcast) {
        suggestedPodcast = JSON.parse(suggestedPodcast)
    }

    console.log("****", data)
    console.log("****suggestPodcast", suggestPodcast)

    rendered && suggestedPodcast.forEach((item, index) => {
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
                    onClick={() => listEpisodes(item.href, false)}

                // onClick={() => alert("Hello from here")}

                ></CardImg>
            </Row>
        </Card>
        suggestPodcast.push(data)
    })

    rendered && Array.isArray(data.podcasts) && podcast.push(


        <Card>
            <Card.Img
                className="d-flex p-2 bd-highlight  g-0 bg-light"
                src={data.image}
                height="250"
            />
            <Card.Body>
                <Card.Title>{data.title}</Card.Title>
                <Card.Text>
                    {data.description}
                </Card.Text>
            </Card.Body>
            <Card.Footer>
                {data.artistName}
            </Card.Footer>
        </Card>

    );

    console.log("Length of pod", podcast.length)

    rendered && Array.isArray(data.podcasts) ? data.podcasts.forEach((item, index) => {


        itemList.push(
            <Row xs={1} md={2} className="g-4">
                <CardGroup>

                    <Card>
                        <Card.Img
                            className="d-flex p-2 bd-highlight  g-0 bg-light"
                            src={data.image}
                            height="250"
                        />
                        <Card.Body>
                            <Card.Title>{item.name}</Card.Title>

                            <Row>
                                <ReactAudioPlayer
                                    src={item.audioUrl}
                                    // autoPlay={true}
                                    controls size={75}
                                // title = "Audio Player"
                                />
                            </Row>
                            <Card.Text>
                                Duration {(item.duration / 60).toFixed(2)} minutes
              </Card.Text>
                            <Card.Subtitle>
                                Published on {new Date(item.pubDate).toDateString()}
                            </Card.Subtitle>
                            <ExpendableText maxHeight={75}>
                                {item.description}
                            </ExpendableText>
                        </Card.Body>

                    </Card>
                </CardGroup>
                {/* </Col> */}
            </Row>


        )
    }) : itemList.push(<li> No episodes</li>)


    if (rendered) {
        return (
            <>
                <Row>
                    <Card className="pagetop">
                        Podcasts
                </Card>
                </Row>
                {/* <Container> */}
                <Row className="justify-content-md-center">
                    <Col md="auto">

                        {/* <p className="text">Your Searched Podcasts</p> */}
                        {podcast}
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
        )
    }

}

const ExpendableText = ({ maxHeight, children }) => {
    const ref = useRef();
    const [shouldShowExpand, setShouldShowExpand] = useState(false);
    const [expanded, setExpanded] = useState(true);

    useEffect(() => {
        if (ref.current.scrollHeight > maxHeight) {
            setShouldShowExpand(true);
            setExpanded(false);
        }
    }, [maxHeight]);

    return (
        <Card.Text ref={ref}>
            <div
                class="inner"
                style={{ maxHeight: expanded ? MAX_POSSIBLE_HEIGHT : maxHeight }}
            >
                {children}
            </div>
            {shouldShowExpand && (
                <button onClick={() => setExpanded(!expanded)}>{
                    expanded ? "Less" : "Expand"}</button>
            )}
        </Card.Text>
    );
};


export default Episodes;