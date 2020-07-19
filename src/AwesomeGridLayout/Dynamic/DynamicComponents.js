import ContainerBase from "../Components/Containers/ContainerBase";
import Header from "../Components/Containers/Header";
import Footer from "../Components/Containers/Footer";
import PageBase from "../Components/Pages/PageBase";
import Section from "../Components/Containers/Section";
import Stack from "../Components/Stack/Stack";
import VerticalSpacer from "../Components/Stack/VerticalSpacer";
import FadeInAnimation from "../Test/Animations/FadeInAnimation";
import RotateAnimation from "../Test/Animations/RotateAnimation";

let DynamicComponents = {};

export let initDynamicComponents = () => {
    DynamicComponents["ContainerBase"] = ContainerBase;
    DynamicComponents["PageBase"] = PageBase;
    DynamicComponents["Header"] = Header;
    DynamicComponents["Footer"] = Footer;
    DynamicComponents["Section"] = Section;
    DynamicComponents["Stack"] = Stack;
    DynamicComponents["VerticalSpacer"] = VerticalSpacer;
};

export default DynamicComponents;

export let DynamicAnimations = {};

export let initDynamicAnimations = () => {
    DynamicAnimations["fadeIn"] = FadeInAnimation;
    DynamicAnimations["rotate"] = RotateAnimation;
};
