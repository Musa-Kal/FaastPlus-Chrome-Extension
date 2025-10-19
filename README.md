<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT LOGO -->
<br>
<div align="center">
  <a href="https://chromewebstore.google.com/detail/faast-plus/lejbdnbbnibjjfjkffhkjmcligdccoej?pli=1">
    <img src="images/Faast-Plus-Logo.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Faast Plus - Chrome Extension</h3>

  <p align="center">
    An chrome extension thats extends the functionality of Fasst wms website.
    <br>
    <a href="https://github.com/Musa-Kal/FaastPlus-Chrome-Extension"><strong>Explore the docs »</strong></a>
    <br>
    <br>
    <a href="https://github.com/Musa-Kal/FaastPlus-Chrome-Extension/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/Musa-Kal/FaastPlus-Chrome-Extension/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
    .
    <a href="https://github.com/Musa-Kal/FaastPlus-Chrome-Extension/blob/main/CHANGELOG.md">Change Logs</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<!-- <details> -->
<h2>Table of Contents</h2>
<ol>
  <li>
    <a href="#about-the-project">About The Project</a>
    <ul>
      <li><a href="#built-with">Built With</a></li>
    </ul>
  </li>
  <li>
    <a href="#getting-started">Getting Started</a>
    <ul>
      <li><a href="#chrome-web-store">Chrome Web Store</a></li>
      <li><a href="#unpacked-installation">Unpacked Installation</a></li>
    </ul>
  </li>
  <li>
    <a href="#usage">Usage</a>
    <ul>
      <li><a href="#claim-license-key">Claim / Obtain License Key</a></li>
    </ul>
  </li>
  <li><a href="#roadmap">Roadmap</a></li>
  <li><a href="#contributing">Top contributors</a></li>
  <li><a href="#license">License</a></li>
  <li><a href="#contact">Contact</a></li>
  <li><a href="#acknowledgments">Acknowledgments</a></li>
</ol>
<!-- </details> -->



<!-- ABOUT THE PROJECT -->
## About The Project


<div align="center">
  <img src="images/Faast-Plus-Logo.png" alt="faast-plus-Logo" width="100" height="100">
  <img src="images/plus-icon.png" alt="faast-plus-Logo" width="100" height="100">
  <img src="images/Faast-wms-logo.png" alt="Faast-wms-Logo" width="100" height="100">
</div>

<br>

There are a lot of features that faast wms website provides but there are also some areas of the website that could be improved, and that is exactly what this project does. It improves and extends faast wms functionality and UI for Associates and P.As. The extension / project also has multiple options thats could be changed in accordance to user preferences. 

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

* Plain JS
* HTML
* CSS

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

The methods to install and add the extension are detailed below.

### Chrome Web Store

This extension can be added to chrome browser through chrome web store.
<br>
[>>> Faast Plus - Chrome Web Store URL <<<][faast-plus-chrome-web-store-url]

### Unpacked Installation

For unpacked version of the extension, please contact the author.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

Once the extension is added to the browser, it will start working out the box.

For information on how to add extension to the browser refer of the <a href="#getting-started">Getting Started</a> section.

This extension has 3 main components to it, Popup, Options Window and Content Scripts. More information about these components will be detailed below.


1. <details>
    <summary>Popup</summary>

    <br>

    Popup can be accessed by clicking on the extension icon in your browser.

    <div align="center">
      <img src="images/popup-screenshot-resized.png" alt="faast-plus-popup-screenshot" width="50%">
      <p>Image of Fast Plus popup window</p>
    </div>

    - Popup allows user to view all the units that user has packed, view logs, edit records and access options window.

    - The detailed records in popup window only go back to last 2 days of submitted records.

    - Logs can be accessed by clicking on the view logs button. 
      <details><summary>Logs Example</summary>
        <br>
        <img src="images/view-logs-screenshot.png" alt="faast-plus-logs-screenshot" width="50%">
        <br>
        Image of logs display section
          
        - Only logs for the last day packed are saved.
      </details>

    - Edit records section can be shown by clicking on the edit records button. 
      <details>
        <summary>Edit Records Example</summary>
        <br>
        <img src="images/edit-records-screenshot.png" alt="faast-plus-edit-records-screenshot" width="50%">
        <br>
        Image of edit records section.
        
        - Only records for the last day packed can be adjusted.
        - Amount of adjustment can be entered in the input field as a number.
        - By clicking the button to the right of the input field, adjustment type can be toggled between addition and subtraction.
        - By clicking the type buttons below the input filed, request to adjust the records for that type of orders will be submitted.
        - Clear All Records button will clear all the records and logs, including the all time records.
      </details>
  </details>

2. <details>
    <summary>Options Window </summary>

    <br>

    Options window can be accessed by clicking on the gear icon in the popup window.

    <div align="center">
      <img src="images/options-window-screenshot.png" alt="faast-plus-popup-screenshot" width="50%">
      <p>Image of Fast Plus options window</p>
    </div>

    - Options window allows users to toggle settings based on user preferences.

    - More options section in options window allows for more custom interactions with faast wms site.
      1. Generate Ready To Pick Report: scrapes the ready to pick section based on range of 2 dates provided and generates a csv or view based on all the pick-tasks found with in that range (report type can be changed using the right most drop down under Generate "Ready To Pick Report" option). 
          - Past Productivity Report: Generates an csv containing all pick task within the date range separated by assignee.
          - Daily Productivity Report: Downloads a csv file formate similar to raw data report but includes column for last update time and generates a view for a given day under more options showing all the pick task and how long they were active for.
          - Raw Data: Generates a csv containing all useful data with in the date range in ready to pick section.

  </details>

3. <details>
    <summary>Content Scripts</summary>

    <br>

    Content scripts run in the background of faast wms website adding new features and extending its functionality.

    1. <details>
          <summary>New Order</summary>
          <br>
          <div align="center">
            <img src="images/PA-View-NewOrder.png" alt="faast-plus-new-order-screenshot" width="200px">
            <p>Image of New Order section Fast Plus [P.A View].</p>
          </div>
          
          - This feature is only available in P.A view.
          - When an ASIN is selected in the new order section; image, weight, size classification and name of the product will be shown below the batch size input field. 

          <br>
          <div align="center">
            <img src="images/PA-View-NewOrder-ExSD-Time-Dropdown.png" alt="faast-plus-new-order-exsd-time-dropdown-screenshot" width="200px">
            <p>Image of New Order section ExSD time dropdown Fast Plus [P.A View].</p>
          </div>
          
          - This feature is only available in P.A view.
          - This feature can be toggled in options page.
          - This feature allows you to save and select time presets for ExSD in New Order section.
        </details>

    2. <details>
          <summary>Ready To Pick</summary>
          <br>

          - <details>
              <summary>A.A View / Default View</summary>
              <br>
              <div align="center">
                <img src="images/AA-View-ReadyToPick.png" alt="faast-plus-ready-to-pick-screenshot" width="50%">
                <p>Image of Ready To Pick section with Fast Plus [A.A / Default View].</p>
              </div>
              
              - A table with summary of all the pick-tasks being displayed on the ready to pick section that are assigned to the logged in user will appear on top of the page. 
            </details>

          - <details>
              <summary>P.A View</summary>
              <br>
              <div align="center">
                <img src="images/PA-View-ReadyToPick.png" alt="faast-plus-P.A-view-ready-to-pick-screenshot" width="50%">
                <p>Image of Ready To Pick section with Fast Plus [P.A View].</p>
              </div>
              
              - This feature is only available in P.A view.
              - A group of 3 numbers will appear at top of page displaying a summary of segmented lines.
              - The line with multiple segments in ready to pick section, each segments represent a share of pick-task assignee for all pick-tasks being displayed in the ready to pick section.
              - The segments are displayed in descending order.
              - A more detail view of that segment can be shown by click of the that segment.
                <details>
                  <summary>Segment Detail View Example</summary>
                  <br>
                  <img src="images/PA-view-View-ReadyToPick-segment-detailed.png" alt="faast-plus-P.A-view-ready-to-pick-segment-detail-screenshot" width="50%">
                  <br>
                  Image of Segment Detail.
                  
                  - Name of the Assignee that the segment belong to will appear, with a table that contains details about that segment.
                </details>

            </details>

        </details>

    3. <details>
          <summary>Ready To Pack</summary>
          <br>

          - <details>
              <summary>Continue To Scan and Verify Section</summary>
              <br>

              <div align="center">
                <img src="images/singleOrderScan-prompt.png" alt="faast-plus-continue-to-scan-and-verify-section-screenshot" width="50%">
                <p>Image of Continue to Scan and Verify section with Fast Plus.</p>
              </div>

              - A green button will appear in scan and verify section, once pressed will send a request to add total units in that pick-task to the total of appropriate type and continue the user to Scan and Verify section.
              - Request adds total to the date of the day button way clicked.

            </details>

          - <details>
              <summary>Scan and Verify Section</summary>
              <br>

              <div align="center">
                <img src="images/singleOrderScan.png" alt="faast-plus-scan-and-verify-section-screenshot" width="50%">
                <p>Image of Scan and Verify section with Fast Plus.</p>
              </div>

              - New Order Scan Assist setting must be turned on for this feature.
              - A table will appear under the input field displaying the total number of units with in the order and total unscanned instances of top / highlighted units.

        </details>
        
    4. <details>
          <summary>Quick Pack Section</summary>
          <br>

          <div align="center">
            <img src="images/quickPack.png" alt="faast-plus-quick-pack-section-screenshot" width="50%">
            <p>Image of Quick Pack section section with Fast Plus.</p>
          </div>

          - Two buttons will appear in quick pack section, one prompting to add to SIOC and continue, and other prompting to add to singles and continue.
          - Once pressed, a request will be sent to add total orders in that pick-task to the total of the type prompted on the button clicked, and continue the user to Scan and Verify section.
          - Request adds total to the date of the day button way clicked.

      </details>

  </details>


### Claim License Key


<b>Why License Keys:</b>
<br>
Reason I went with license keys is so I can give role based access to users, and I implemented license keys in particular because I wanted minimum possible effort on users end and I didn't want users to give their credentials to create an account.

<b>How to obtain a key:</b>
<br>
The only way to obtain a key currently is to <a href="#contact">contact</a> the developer.

<b>What does role mean:</b>
<br>
Each license key has a role assigned to it, higher the role number more access the user will have. Default role without license is 0 and some features will be locked based on your role number.

<b>How to claim an license key:</b>
<br>
Options Page > Claim License Section > Insert Key > Press Claim License

<div align="center">
  <img src="images/license-section.png" alt="faast-plus-license-section-screenshot" width="50%">
  <p>Claim license section in Options page.</p>
</div>

<div align="center">
  <img src="images/licesnse-section-once-key-claimed.png" alt="faast-plus-license-section-screenshot" width="50%">
  <p>Claim license section once a license is claimed.</p>
</div>

<ul>
  <li><b>Delete License Button:</b> pressing it will remove the license.</li>
  <li><b>SYNC License button:</b> pressing it will sync the license with the server.</li>
</ul>

<br>


<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

- Actively looking for feedback and new feature ideas.

See the [open issues](https://github.com/Musa-Kal/FaastPlus-Chrome-Extension/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Top contributors:

<a href="https://github.com/Musa-Kal/FaastPlus-Chrome-Extension/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Musa-Kal/FaastPlus-Chrome-Extension" alt="contrib.rocks image" />
</a>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Email - musakaleem1411+github@gmail.com

LinkedIn - [https://linkedin.com/in/musa-kaleem-122249294](https://linkedin.com/in/musa-kaleem-122249294)

Project Link - [https://github.com/Musa-Kal/FaastPlus-Chrome-Extension](https://github.com/Musa-Kal/FaastPlus-Chrome-Extension)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* [Best-README-Template](https://github.com/othneildrew/Best-README-Template.git) by Othneil Drew

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[faast-plus-chrome-web-store-url]: https://chromewebstore.google.com/detail/faast-plus/lejbdnbbnibjjfjkffhkjmcligdccoej?pli=1
[contributors-shield]: https://img.shields.io/github/contributors/Musa-Kal/FaastPlus-Chrome-Extension.svg?style=for-the-badge
[contributors-url]: https://github.com/Musa-Kal/FaastPlus-Chrome-Extension/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Musa-Kal/FaastPlus-Chrome-Extension.svg?style=for-the-badge
[forks-url]: https://github.com/Musa-Kal/FaastPlus-Chrome-Extension/network/members
[stars-shield]: https://img.shields.io/github/stars/Musa-Kal/FaastPlus-Chrome-Extension.svg?style=for-the-badge
[stars-url]: https://github.com/Musa-Kal/FaastPlus-Chrome-Extension/stargazers
[issues-shield]: https://img.shields.io/github/issues/Musa-Kal/FaastPlus-Chrome-Extension.svg?style=for-the-badge
[issues-url]: https://github.com/Musa-Kal/FaastPlus-Chrome-Extension/issues
[license-shield]: https://img.shields.io/github/license/Musa-Kal/FaastPlus-Chrome-Extension.svg?style=for-the-badge
[license-url]: https://github.com/Musa-Kal/FaastPlus-Chrome-Extension/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/musa-kaleem-122249294
